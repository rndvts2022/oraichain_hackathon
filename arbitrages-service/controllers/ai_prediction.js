const path = require('path')
const fetch = require('isomorphic-fetch')
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing')
const { stringToPath } = require('@cosmjs/crypto')
const cosmwasm = require('@cosmjs/cosmwasm-stargate')

const SERVICE = "priceprediction";
const {
  GasPrice,
} = require('@cosmjs/cosmwasm-stargate/node_modules/@cosmjs/stargate/build')
require('dotenv').config({
  path: path.resolve(
    __dirname,
    process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
  ),
})

// .env file

/**
 * MNEMONIC=""
WEBSOCKET_URL=ws://testnet-rpc.orai.io // testnet ip
LCD_URL=http://testnet-lcd.orai.io
CONTRACT_ADDRESS=orai1s60a2vntfuv2ps6fs75fcrlrmea9xzr4k65zlg // testnet contract
BACKEND_URL=https://testnet-aioracle-svr.orai.io
 */

const network = {
  rpc: process.env.NETWORK_RPC || 'https://testnet-rpc.orai.io',
  prefix: 'orai',
}

const collectWallet = async (mnemonic) => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
    prefix: network.prefix,
  })
  return wallet
}

const execute = async ({
  mnemonic,
  address,
  handleMsg,
  memo,
  amount,
  gasData = undefined,
}) => {
  try {
    const wallet = await collectWallet(mnemonic)
    const [firstAccount] = await wallet.getAccounts()
    const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(
      network.rpc,
      wallet,
      {
        gasPrice: gasData
          ? GasPrice.fromString(`${gasData.gasAmount}${gasData.denom}`)
          : undefined,
        prefix: network.prefix,
        gasLimits: { exec: 20000000 },
      },
    )
    const input = JSON.parse(handleMsg)
    const result = await client.execute(
      firstAccount.address,
      address,
      input,
      memo,
      amount,
    )
    return result.transactionHash
  } catch (error) {
    console.log('error in executing contract: ', error)
    throw error
  }
}

const price_prediction = async () => {
  const contractAddr = process.env.CONTRACT_ADDRESS
  //   console.log('contract addr: ', contractAddr)
  const wallet = process.env.MNEMONIC
  const threshold = process.env.THRESHOLD || 1
  // const service = process.env.SERVICE
  const service = SERVICE
  const lcdUrl = process.env.LCD_URL || 'https://testnet-lcd.orai.io'
  const backendUrl =
    process.env.BACKEND_URL || 'https://testnet-aioracle-svr.orai.io'
  const [feeAmount, boundExecutorFee] = await getArbitrage(
    contractAddr,
    lcdUrl,
    service,
    threshold,
  )
  // const feeAmount = [{ denom: "orai", amount: "1000" }]
  let finalFeeAmount = feeAmount.filter((fee) => fee.amount !== '0')
  if (finalFeeAmount.length === 0) finalFeeAmount = undefined
  const input = JSON.stringify({
    request: {
      threshold: parseInt(threshold),
      service,
      preference_executor_fee: boundExecutorFee,
    },
  })
  //   console.log('input: ', input)

  // store the merkle root on-chain
  const txHash = await execute({
    mnemonic: wallet,
    address: contractAddr,
    handleMsg: input,
    gasData: { gasAmount: '0', denom: 'orai' },
    amount: finalFeeAmount,
  })
  //   console.log('execute result: ', txHash)
  const requestId = await collectRequestId(lcdUrl, txHash)
  //   console.log('request id: ', requestId)
  //   console.log('Collecting the reports, please wait...')
  const reports = await collectReports(backendUrl, contractAddr, requestId)
  let prices = JSON.parse(reports.substring(2, reports.length - 2))
  // console.log(prices)
  return prices
}

const getArbitrage = async (contractAddr, lcdUrl, service, threshold) => {
  const getArbitrageMsg = JSON.stringify({
    get_service_fees: {
      service,
    },
  })
  const boundExecutorFeeMsg = JSON.stringify({
    get_bound_executor_fee: {},
  })
  let rawData = await fetch(
    `${lcdUrl}/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(
      getArbitrageMsg,
    ).toString('base64')}`,
  ).then((data) => data.json())
  let data = rawData.data
  let boundFee = await fetch(
    `${lcdUrl}/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(
      boundExecutorFeeMsg,
    ).toString('base64')}`,
  ).then((data) => data.json())
  let boundExecutorFee = boundFee.data
  //   console.log('data: ', rawData)
  data.push(['placeholder', boundExecutorFee.denom, boundExecutorFee.amount])
  data = data
    .map((reward) => ({ denom: reward[1], amount: parseInt(reward[2]) }))
    .reduce((prev, curr) => {
      if (prev.constructor === Array) {
        // find if the current denom exists already in the accumulator
        const index = prev.findIndex(
          (prevElement) => prevElement.denom === curr.denom,
        )
        if (index !== -1) {
          // if exist then we update the amount of the index in the accumulator, then keep the accumulator
          prev[index].amount += curr.amount
          return prev
        }
        // if does not exist then we append the current obj into the accumulator
        return [...prev, curr]
      } else {
        if (prev.denom === curr.denom)
          return [{ ...prev, amount: prev.amount + curr.amount }]
      }
      return [...prev, curr]
    }, [])
    .map((reward) => ({ ...reward, amount: String(reward.amount * threshold) }))
  return [data, boundExecutorFee]
}

const collectRequestId = async (lcdUrl, txHash) => {
  let requestId = -1
  let count = 0 // break the loop flag
  let hasRequestId = true
  do {
    hasRequestId = true
    try {
      const result = await fetch(
        `${lcdUrl}/cosmos/tx/v1beta1/txs/${txHash}`,
      ).then((data) => data.json())
      const wasmEvent = result.tx_response.events
        .filter((event) => event.type === 'wasm')[0]
        .attributes.filter(
          (attr) => attr.key === Buffer.from('stage').toString('base64'),
        )[0].value
      requestId = Buffer.from(wasmEvent, 'base64').toString('ascii')
    } catch (error) {
      hasRequestId = false
      count++
      if (count > 30) break // break the loop and return the request id.
      // sleep for a few seconds then repeat
      await new Promise((r) => setTimeout(r, 1000))
    }
  } while (!hasRequestId)
  return requestId
}

const collectReports = async (url, contractAddr, requestId) => {
  let count = 0
  let reports = {}
  const reportUrl = `${url}/report/reports?contract_addr=${contractAddr}&request_id=${requestId}`
  // console.log('report url: ', reportUrl)
  do {
    reports = await fetch(reportUrl).then((data) => data.json())
    // console.log('reports.data.data.length: ', reports.data.data.length)
    if (!reports.data || reports.data.data.length === 0) {
      count++
      if (count > 20) break // break the loop and return the request id.
      // sleep for a few seconds then repeat
      await new Promise((r) => setTimeout(r, 1000))
    }
  } while (!reports.data || reports.data.data.length === 0)
  let res = Buffer.from(reports.data.data[0].report.data, 'base64').toString(
    'ascii',
  )
  return res.replace(/\\/g, '')
}

exports.pricePrediction = async function (req, res) {

  try {

    let data = await price_prediction();
    // console.log(data)
    // data = JSON.parse(data);

    return res.status(200).send({ ok: true, result: data });

  } catch (err) {
    return res.status(500).send({ ok: false, error: { message: err, code: 500 } });
  }

};

price_prediction();


