const abiDecoder = require('abi-decoder');
const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk');
const ethers = require('ethers');
const url = 'https://mainnet.infura.io/v3/d082d7d751654b999a930e38bd93cf07';
const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
const chainId = ChainId.MAINNET;

const {
    UNISWAP_ROUTER_ADDRESS,
    UNISWAP_FACTORY_ADDRESS,
    UNISWAP_ROUTER_ABI,
    UNISWAP_FACTORY_ABI,
    UNISWAP_POOL_ABI
} = require('../utils/constants.js');

class UniswapHelper {

    constructor(web3jsHelper) {
        this.web3jsHelper = web3jsHelper

        try {
            // connect Smart contract of Uniswap 
            this.uniswapRouter = this.web3jsHelper.getContractConnection(UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS);
            this.uniswapFactory = this.web3jsHelper.getContractConnection(UNISWAP_FACTORY_ABI, UNISWAP_FACTORY_ADDRESS);
            abiDecoder.addABI(UNISWAP_ROUTER_ABI);

        } catch (error) {
            console.error(error);
        }
    }

    tradingFee() {
        return 0.003
    }

    async getRateOfTokenPair(basedTokenAddress, quotedTokenAddress) {

        let token_src = await Fetcher.fetchTokenData(chainId, basedTokenAddress, customHttpProvider);
        let token_dst = await Fetcher.fetchTokenData(chainId, quotedTokenAddress, customHttpProvider);

        const pair = await Fetcher.fetchPairData(token_dst, token_src, customHttpProvider);

        // Mid Price
        const route = new Route([pair], token_src);
        console.log("Mid Price token_src --> token_dst:", route.midPrice.toSignificant(6));
        console.log("Mid Price token_dst --> token_src:", route.midPrice.invert().toSignificant(6));

        return {
            'midPrice':route.midPrice.toSignificant(6),
            'invertMidPrice':route.midPrice.invert().toSignificant(6)
        }
    }


    // async getBestSwap(amout) {
    //     var token_src;
    //     var token_dst;

    //     token_src = await Fetcher.fetchTokenData(chainId, this.input_token_info.address, customHttpProvider);
    //     token_dst = await Fetcher.fetchTokenData(chainId, this.out_token_info.address, customHttpProvider);

    //     const pair = await Fetcher.fetchPairData(token_dst, token_src, customHttpProvider);

    //     // Mid Price
    //     const route = new Route([pair], token_src);
    //     console.log("Mid Price token_src --> token_dst:", route.midPrice.toSignificant(6));
    //     console.log("Mid Price token_dst --> token_src:", route.midPrice.invert().toSignificant(6));

    //     // Execution Price 
    //     // console.log("Amount: ", amout)
    //     const trade = new Trade(route, new TokenAmount(token_src, amout), TradeType.EXACT_INPUT);
    //     console.log("Execution Price token_src --> token_dst:", trade.executionPrice.toSignificant(6));
    //     console.log("Mid Price after trade token_src --> token_dst:", trade.nextMidPrice.toSignificant(6));

    //     return trade.outputAmount.toSignificant(7)

    // }

}


module.exports = {
    UniswapHelper
}