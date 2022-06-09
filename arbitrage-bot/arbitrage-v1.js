
const axios = require('axios');
const Web3 = require('web3');
const convert = require('ethereum-unit-converter')
const moment = require('moment');
require('dotenv').config()

const { Web3jsHelper } = require('./utils/web3js-helper.js');
const { UniswapHelper } = require('./exchanges/uniswap-helper.js');
const { KucoinHelper } = require('./exchanges/kucoin-helper');
const CommonHelper = require('./utils/common-helper.js');

const { FRONT_BOT_ADDRESS, BOT_ABI, NETWORK, UNISWAP_ROUTER_ADDRESS, UNISWAP_FACTORY_ADDRESS,
    UNISWAP_ROUTER_ABI, UNISWAP_FACTORY_ABI, UNISWAP_POOL_ABI, HTTP_PROVIDER_LINK,
    WEBSOCKET_PROVIDER_LINK, HTTP_PROVIDER_LINK_TEST } = require('./utils/constants.js');
const { TOKEN_ADDRESS, ETH_GAS_API, AMOUNT, LEVEL } = require('./utils/env.js');

var web3jsHelper, uniswapHelper, kucoinHelper;

const PRIVATE_KEY = process.env.PRIVATE_KEY
var user_wallet;

const baseTokenAllowedAmount = process.env.baseTokenAllowedAmount
const baseTokenSymbol = process.env.baseTokenSymbol
const baseToken = process.env.baseToken

const quoteTokenAllowedAmount = process.env.quoteTokenAllowedAmount
const quoteTokenSymbol = process.env.quoteTokenSymbol
const quoteToken = process.env.quoteToken

const gasLimit = process.env.gasLimit
const kFees = process.env.kFees
const uFees = process.env.uFees

const kucoinPairToken = process.env.kucoinPairToken
const kucoinConfig = {
    apiKey: process.env.kucoinApiKey,
    secret: process.env.kucoinSecret,
    password: process.env.kucoinPasswork
}


async function initNetwork() {
    const web3 = new Web3(new Web3.providers.HttpProvider(HTTP_PROVIDER_LINK));
    // const web3Ws = new Web3(new Web3.providers.WebsocketProvider(WEBSOCKET_PROVIDER_LINK));

    const network = NETWORK;
    user_wallet = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    const input_token_address = baseToken;
    const out_token_address = quoteToken;

    const botHelper = null;
    web3jsHelper = new Web3jsHelper(HTTP_PROVIDER_LINK, ETH_GAS_API, NETWORK)
    uniswapHelper = new UniswapHelper(web3jsHelper, botHelper, network, user_wallet, input_token_address, out_token_address)
    kucoinHelper = new KucoinHelper(kucoinConfig, kucoinPairToken)

    // const amount = web3.utils.toEth('1', 'ether');
    // const value = web3.utils.toHex(amount);
    // let gasFee = 21000 * 40
    // console.log(convert(gasFee, 'gwei', 'wei')) // 1000000000000000000
    // let orderBook = await kucoinHelper.getOrderBook(20)
    // let price = kucoinHelper.getAveragePrice(baseTokenAllowedAmount, orderBook.asks)
    // console.log(price)
}

async function balanceInfo() {
    // balance from wallet
    let balance = await web3jsHelper.getBalance(user_wallet.address);
    const tokenABIRRequest = web3jsHelper.getTokenAbiRequest('mainnet', quoteToken)
    let token = await web3jsHelper.getTokenInfo(quoteToken, tokenABIRRequest, user_wallet.address)

    // balance from kucoin Exchange
    let kucoinBalance = await kucoinHelper.fetchBalance();

    return {
        'walletBaseToken': balance,
        'walletQuoteToken': token.balance,
        'kucoinBaseToken': kucoinBalance.total[baseTokenSymbol] != undefined ? kucoinBalance.total[baseTokenSymbol] : 0,
        'kucoinQuoteToken': kucoinBalance.total[quoteTokenSymbol] != undefined ? kucoinBalance.total[quoteTokenSymbol] : 0
    }
}

async function doSellFirst() {
    // Kucoin Sell: 10 ETH --> X USDT 
    // Uniswap Swap: X USDT --> I ETH
    // ETH/USDT

    /*
    v maxBaseToken: base Token Allowed Amount
    v thresh: thresh for profit if suitable
    v P: average price on kucoin (token A - B)
    v kFee: fee trade on kucoin
    v q1 =  P * maxBaseToken: total amount (USDT) pay for trade in Kucoin
    v b1= maxBaseToken - (maxBaseToken * kFees): total receive (ETH)

    v b2: swap from token ETH to USDT with amount=b1
    v g=g*gasLimit: current highest gas price
    v txFees = g*P: transaction fee
    v uFees: fee trade on uniswapp

    v i=b2-(b2*uFees)-txFees
    v pr=i-b1 : profit

    */
    console.log("\n ==========Sell===============")

    let maxBaseToken = baseTokenAllowedAmount
    let thresh = 50

    /* Kucoin */
    let orderBook = await kucoinHelper.getOrderBook(50)
    let P = kucoinHelper.getAveragePrice(baseTokenAllowedAmount, orderBook.bids) // giá cần mua trên thị trường hiện tại
    console.log("P: ", P)
    let b1 = maxBaseToken // so luong basetoken duoc phep giao dich
    console.log("b1: ", b1)
    let q1 = ((P * b1) - (P * b1 * kFees)) // Tiền thu về sau khi bán 5 ETH
    console.log("q1: ", q1)

    /* Uniswap */
    let gasCurrentInfo = await web3jsHelper.getCurrentGasPrices()
    let g = gasCurrentInfo.high * gasLimit
    console.log("g: ", g)
    let txFees = convert(g, 'gwei', 'ether')
    console.log("txFees: ", txFees)
    let totalSwap = (parseInt(b1) + parseFloat(txFees)) / (1 - parseFloat(uFees))
    console.log("totalSwap: ", totalSwap)
    let b2 = await uniswapHelper.getBestSwap(convert(totalSwap, 'ether', 'wei')) // giá quy đổi 1 USDT sang ETH
    console.log("b2: ", b2)

    let pr = q1 - b2
    console.log("pr: ", pr)
    let isProfit = (pr >= thresh) ? 1 : (pr > 0 ? 0 : -1) // pr > thread: 



    if (pr > thresh) {
        // do sell on Kucoin

        // do swap on Uni

        console.log("Sell: have profit")
    } else {
        console.log("Sell: have no profit")
    }

    // send to view in website
    let balanceAfterTrade = await balanceInfo()
    let sellAction = {
        'action': 'SELL',
        'baseAmount': maxBaseToken + " " + baseTokenSymbol,
        'time': moment().format('MM-DD-yyyy:hh:mm:ss'),
        'P': P.toFixed(2) + " " + kucoinPairToken,
        'b1': b1,
        'kFee': (P * b1 * kFees).toFixed(2) + " " + quoteTokenSymbol,
        'q1': parseFloat(q1).toFixed(4),
        'cg': gasCurrentInfo.high + " gwei",
        'g': convert(g, 'gwei', 'ether') + " ETH",
        'txFees': parseFloat(txFees).toFixed(4) + " ETH",
        'totalSwap': parseFloat(totalSwap).toFixed(4) + " " + baseTokenSymbol,
        'b2': b2 + " " + quoteTokenSymbol,
        'pr': parseFloat(pr).toFixed(4) + " " + quoteTokenSymbol,
        'isProfit': isProfit,
        'isTrade': false,
        'balanceAfterTrade': balanceAfterTrade
    }

    await axios.post(process.env.TRADE_SERVICE, sellAction)
        .then(function (response) {
            console.log(`ACTOIN SELL send to view: ${response.data.status}`);
        })
        .catch(function (error) {
            console.log(error);
        });


}

async function doBuyFirst() {
    // Kucoin Buy: 5000 USDT --> X ETH
    // Uniswap Swap: X ETH --> I USDT
    // ETH/USDT

    /*
    v maxBaseToken: base Token Allowed Amount
    v thresh: thresh for profit if suitable
    v P: average price on kucoin (token A - B)
    v kFee: fee trade on kucoin
    v q1 =  P * maxBaseToken: total amount (USDT) pay for trade in Kucoin
    v b1= maxBaseToken - (maxBaseToken * kFees): total receive (ETH)

    v b2: swap from token ETH to USDT with amount=b1
    v g=g*gasLimit: current highest gas price
    v txFees = g*P: transaction fee
    v uFees: fee trade on uniswapp

    v i=b2-(b2*uFees)-txFees
    v pr=i-b1 : profit

    */
    console.log("\n ==========Buy===============")
    let maxBaseToken = baseTokenAllowedAmount
    let thresh = 50

    /* Kucoin */
    let orderBook = await kucoinHelper.getOrderBook(50)
    let P = kucoinHelper.getAveragePrice(baseTokenAllowedAmount, orderBook.asks)
    // let P = 2598
    console.log("P: ", P)
    let q1 = P * maxBaseToken
    console.log("q1: ", q1)
    let b1 = maxBaseToken - (maxBaseToken * kFees)
    console.log("b1: ", b1)

    /* Uniswap */
    let b2 = await uniswapHelper.getBestSwap(convert(b1, 'ether', 'wei'))
    console.log("b2: ", b2)
    let gasCurrentInfo = await web3jsHelper.getCurrentGasPrices()
    let g = gasCurrentInfo.high * gasLimit
    console.log("g: ", g)
    let txFees = convert(g, 'gwei', 'ether') * P
    console.log("txFees: ", txFees)
    let i = b2 - (b2 * uFees) - txFees
    console.log("income: ", i)

    /* Profit */
    let pr = i - q1
    console.log("pr: ", pr)
    let isProfit = (pr >= thresh) ? 1 : (pr > 0 ? 0 : -1) // pr > thread: 

    if (pr > thresh) {
        console.log("Buy: have profit")
    } else {
        console.log("Buy: have no profit")
    }
    
    // send to view in website
    let balanceAfterTrade = await balanceInfo()
    let buyAction = {
        'action': 'BUY',
        'baseAmount': maxBaseToken + " " + baseTokenSymbol,
        'time': moment().format('MM-DD-yyyy:hh:mm:ss'),
        'P': P.toFixed(2) + " " + kucoinPairToken,
        'b1': b1 + " " + quoteTokenSymbol,
        'kFee': (P * b1 * kFees).toFixed(2) + " " + quoteTokenSymbol,
        'q1': q1.toFixed(4),
        'cg': gasCurrentInfo.high + " gwei",
        'g': parseFloat(convert(g, 'gwei', 'ether')).toFixed(4) + " ETH",
        'txFees': parseFloat(txFees).toFixed(4) + " " + quoteTokenSymbol,
        'b2': b2 + " " + quoteTokenSymbol,
        'i': i.toFixed(4),
        'pr': parseFloat(pr).toFixed(4) + " " + quoteTokenSymbol,
        'isProfit': isProfit,
        'isTrade': false,
        'balanceAfterTrade': balanceAfterTrade
    }

    await axios.post(process.env.TRADE_SERVICE, buyAction)
        .then(function (response) {
            console.log(`ACTOIN BUY send to view: ${response.data.status}`);
        })
        .catch(function (error) {
            console.log(error);
        });
}

//start trading
async function startLoop() {
    await doSellFirst()
    await doBuyFirst()
}

async function main() {
    await initNetwork()
    setInterval(startLoop, 10000);
    // await balanceInfo()
}

main()