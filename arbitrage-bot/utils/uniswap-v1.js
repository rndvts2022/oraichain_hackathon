
const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk');
const ethers = require('ethers');
const url = 'https://mainnet.infura.io/v3/d082d7d751654b999a930e38bd93cf07';
const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
const chainId = ChainId.MAINNET;

const getBestSwap = async (token_source_address, token_dest_address, isInvert, amout) => {

    const token_src = await Fetcher.fetchTokenData(chainId, token_source_address, customHttpProvider);
    const token_dst = await Fetcher.fetchTokenData(chainId, token_dest_address, customHttpProvider);
    // const token_input = await Fetcher.fetchTokenData(chainId, input_address, customHttpProvider);

    const pair = await Fetcher.fetchPairData(token_src, token_dst, customHttpProvider);

    // Execution Price 
    console.log("Amount: ", amout)
    const route = new Route([pair], token_src);
    // Mid Price
    console.log("Mid Price token_src --> token_dst:", route.midPrice.toSignificant(6));
    console.log("Mid Price token_dst --> token_src:", route.midPrice.invert().toSignificant(6));

    const trade = new Trade(route, new TokenAmount(token_src, amout), TradeType.EXACT_INPUT);
    console.log("Execution Price token_src --> token_dst:", trade.executionPrice.toSignificant(10));
    console.log("Mid Price after trade token_src --> token_dst:", trade.nextMidPrice.toSignificant(10));
    if (!isInvert) {
        console.log("op: ", trade.outputAmount.toSignificant(10))
        return trade.outputAmount.toSignificant(7)
    } else {
        console.log("op 2: ", trade.outputAmount.invert().toSignificant(10))
        return trade.outputAmount.invert().toSignificant(7)
    }
    // let op = trade.outputAmount.invert().toSignificant(7)
}

console.log(trade.priceImpact.toSignificant(6));
console.log(trade.executionPrice.toSignificant(6));
console.log(trade.outputAmount.toSignificant(6));

const DAIAdress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const ETHAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const USDTAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const PolyAddress = '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'

const UOSAddress = '0xD13c7342e1ef687C5ad21b27c2b65D772cAb5C8c'

const token_source_address = UOSAddress
const token_dest_address = USDTAddress
// const amountIn = "1000000000000000000"; // 1 WETH
const amountIn1 = "5400000000000000000000"; // 5400 USDT
const amountIn = "12300000"
getBestSwap(token_source_address, token_dest_address, 0, amountIn)
// getBestSwap(token_dest_address, token_source_address, 0, amountIn1)

// console.log("\n \n")
// getBestSwap(token_source_address, token_dest_address, token_dest_address, amountIn1)


const AmountFormat = async (address, amountIn) => {
    // const percent = new Percent("50", "100");
    // console.log(percent.toSignificant(6)); // 60

    const mytoken = await Fetcher.fetchTokenData(chainId, address, customHttpProvider);
    const tokenAmount = new TokenAmount(mytoken, amountIn);
    console.log(tokenAmount.toExact()); // 3
}

// AmountFormat(UOSAddress, amountIn)
// AmountFormat(USDTAddress, amountIn1)


