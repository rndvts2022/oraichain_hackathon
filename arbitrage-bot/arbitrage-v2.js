const axios = require('axios');
const Web3 = require('web3');
const convert = require('ethereum-unit-converter')
const moment = require('moment');
require('dotenv').config()

const { Web3jsHelper } = require('./utils/web3js-helper.js');
const { UniswapHelper } = require('./exchanges/uniswap-helper-v2.js');
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

const kucoinPairToken = process.env.kucoinPairToken
const kucoinConfig = {
    apiKey: process.env.kucoinApiKey,
    secret: process.env.kucoinSecret,
    password: process.env.kucoinPasswork
}

async function initNetwork() {
    const web3 = new Web3(new Web3.providers.HttpProvider(HTTP_PROVIDER_LINK));

    const network = NETWORK;
    user_wallet = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

    web3jsHelper = new Web3jsHelper(HTTP_PROVIDER_LINK, ETH_GAS_API, NETWORK)
    uniswapHelper = new UniswapHelper(web3jsHelper)
    kucoinHelper = new KucoinHelper(kucoinConfig, kucoinPairToken)

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function doBuyUniswapSellKucoin() {
    console.log("========== Moment Case 1: " + " Start :" + CommonHelper.getCurrentTime() + "===============")

    // Case 1: If rate UOS/USDT on Uni less than Kucoin
    /* 
        Step 1. Buy UOS by USDT from Uniswap
         For ex: On Uniswap: Use 1000 USDT --> Got 900 UOS
        Step 2. Sell UOS to Kucoin
         For ex: On kucoin: Sell 900 UOS --> Got 1111 USDT
        
        => We got profit: 1111 - 1000 = 111 USDT
    */

    const kFees = process.env.kFees // Kucoin Fee on Trading
    const uFees = process.env.uFees // Uniswap Fee on Trading - maybe this value change realtime

    let b1 = 1000; //number of USDT to buy UOS from Uniswap
    let M1; // rate of Token pair on Uniswap
    let P1; // number of UOS after swap on Uniswap

    let n2 = 50; // the last numbers of orderbooks on kucoin
    let M2; // average rate of Token pair on Kucoin
    let P2; // number of USDT after trading on Kucoin

    let p; //Final Profit after arbitrage
    let t = 10 // threshold of profit
    let isExecution;

    let g = 1; // current gas price on network(Ethereum Network, BSC Network, Matic Network...) --> will be change

    let rate = await uniswapHelper.getRateOfTokenPair(baseToken, quoteToken) /** Get rate on Uniswap**/
    M1 = rate.invertMidPrice;
    console.log("M1: ", M1)
    P1 = M1 * b1 * (1 - uFees);
    console.log("P1: ", P1)

    let orderBook = await kucoinHelper.getOrderBook(n2) // get orderbooks on Kucoin
    M2 = kucoinHelper.getAveragePrice(M1, orderBook.asks) //asks: sell-side on Kucoin
    console.log("M2: ", M2)
    P2 = M2 * P1 * (1 - kFees);
    console.log("P2: ", P2)

    p = P2 - b1 - g;
    console.log("p: ", p)

    if (p > t) {
        console.log("Profit: " + p + "(USDT)")
        isExecution = true
    } else {
        console.log("Not Profit: " + p + "(USDT)")
        isExecution = false
    }

    let balanceAfterTrade = await balanceInfo();
    let doBuyUniswapSellKucoin = {
        'kFees': kFees,
        'uFees': uFees,
        'b1': b1,
        'g': g,
        't': t,
        'M1': parseFloat(M1).toFixed(2),
        'P1': P1.toFixed(2),
        'n2': n2,
        'M2': M2.toFixed(2),
        'P2': P2.toFixed(2),
        'p': p.toFixed(2),
        'isExecution': isExecution,
        'typeTrade': 'doBuyUniswapSellKucoin',
        'kucoinPairToken': kucoinPairToken,
        'balanceAfterTrade': balanceAfterTrade,
        'time': moment().format('MM-DD-yyyy:hh:mm:ss')
    }

    await axios.post(process.env.TRADE_SERVICE, doBuyUniswapSellKucoin)
        .then(function (response) {
            console.log(`Buy From Uniswap And Sell To Kucoin: ${response.data.status}`);
        })
        .catch(function (error) {
            console.log(error);
        });

    console.log("========== Moment " + " Finish :" + CommonHelper.getCurrentTime() + "===============\n")

}

async function doBuyKucoinSellUniswap() {
    console.log("========== Moment Case 2: " + " Start :" + CommonHelper.getCurrentTime() + "===============")

    // Case 2: If rate UOS/USDT on Uniswap higher than Kucoin
    /* 
        Step 1. Buy UOS by USDT from Kucoin
         For ex: On Kucoin: Use 1000 USDT --> Got 900 UOS
        Step 2. Sell UOS on Uniswap
         For ex: On Uniswap: Sell 900 UOS --> Got 1111 USDT
        => We got profit: 1111 - 1000 = 111 USDT
    */

    const kFees = process.env.kFees // Kucoin Fee on Trading
    const uFees = process.env.uFees // Uniswap Fee on Trading - maybe this value change realtime

    let n1 = 50; // the last numbers of orderbooks on kucoin
    let b1 = 1000; // number of UOS need to buy from Kucoin
    let M1; // average rate of Token pair on Kucoin
    let P1; // total of USDT need to pay after buying UOS from Kucoin

    let M2; // rate of Token pair on Uniswap
    let P2; // number of USDT after swaping on Uniswap

    let p; //Final Profit after arbitrage
    let t = 10 // threshold of profit

    let g = 1; // current gas price on network(Ethereum Network, BSC Network, Matic Network...) --> will be change
    let isExecution;

    let orderBook = await kucoinHelper.getOrderBook(n1) // get orderbooks on Kucoin
    M1 = kucoinHelper.getAveragePrice(b1, orderBook.bids) //bids: buy-side on Kucoin
    console.log("M1: ", M1)
    P1 = b1 * M1 * (1 - kFees);
    console.log("P1: ", P1)

    let rate = await uniswapHelper.getRateOfTokenPair(baseToken, quoteToken) /** Get rate on Uniswap**/
    M2 = rate.midPrice;
    console.log("M2: ", M2)
    P2 = M2 * b1 * (1 - uFees);
    console.log("P2: ", P2)

    p = P2 - P1 - g;
    console.log("p: ", p)

    if (p > t) {
        console.log("Profit: " + p + "(USDT)")
        isExecution = true;
    } else {
        console.log("Not Profit: " + p + "(USDT)")
        isExecution = false;
    }

    let balanceAfterTrade = await balanceInfo();
    let doBuyKucoinSellUniswap = {
        'kFees': kFees,
        'uFees': uFees,
        'b1': b1,
        'n1': n1,
        'M1': parseFloat(M1).toFixed(2),
        'P1': P1.toFixed(2),
        'M2': parseFloat(M2).toFixed(2),
        'P2': P2.toFixed(2),
        'p': p.toFixed(2),
        'g': g,
        't': t,
        'isExecution': isExecution,
        'typeTrade': 'doBuyKucoinSellUniswap',
        'kucoinPairToken': kucoinPairToken,
        'balanceAfterTrade': balanceAfterTrade,
        'time': moment().format('MM-DD-yyyy:hh:mm:ss')
    }

    await axios.post(process.env.TRADE_SERVICE, doBuyKucoinSellUniswap)
        .then(function (response) {
            console.log(`Buy From Uniswap And Sell To Kucoin: ${response.data.status}`);
        })
        .catch(function (error) {
            console.log(error);
        });

    console.log("========== Moment " + " Finish :" + CommonHelper.getCurrentTime() + "===============\n")

}

async function main() {
    await initNetwork()
    while (true) {
        await new Promise(r => setTimeout(r, 5000));
        await doBuyUniswapSellKucoin()
        await new Promise(r => setTimeout(r, 5000));
        await doBuyKucoinSellUniswap()
    }
}

main()