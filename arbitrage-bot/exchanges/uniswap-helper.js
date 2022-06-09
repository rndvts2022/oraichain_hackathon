const Web3 = require('web3');
const abiDecoder = require('abi-decoder');
const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk');
const ethers = require('ethers');
const url = 'https://mainnet.infura.io/v3/d082d7d751654b999a930e38bd93cf07';
const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
const chainId = ChainId.MAINNET;

const {
    UNISWAP_ROUTER_ADDRESS, UNISWAP_FACTORY_ADDRESS,
    UNISWAP_ROUTER_ABI, UNISWAP_FACTORY_ABI,
    UNISWAP_POOL_ABI, HTTP_PROVIDER_LINK,
    WEBSOCKET_PROVIDER_LINK, HTTP_PROVIDER_LINK_TEST } = require('../utils/constants.js');
const { AMOUNT, LEVEL, BUY, SELL, ONE_GWEI } = require('../utils/env.js');

class UniswapHelper {

    constructor(web3jsHelper, botHelper, network, user_wallet, input_token_address, out_token_address) {
        this.web3jsHelper = web3jsHelper
        this.botHelper = botHelper
        this.network = network
        this.user_wallet = user_wallet

        this.input_token_info = {
            address: input_token_address
        }
        this.out_token_info = {
            address: out_token_address
        }
        this.pool_info;
        this.gas_price_info;

        this.attack_started = false;
        this.buy_failed = false;
        this.sell_failed = false;
        this.succeed = false;

        try {

            // connect etherum by web3js
            this.web3 = this.web3jsHelper.getWeb3jsConnection(HTTP_PROVIDER_LINK);
            this.web3Ts = this.web3jsHelper.getWeb3jsConnection(HTTP_PROVIDER_LINK_TEST);
            // this.web3Ws = this.web3jsHelper.getWeb3jsConnection(WEBSOCKET_PROVIDER_LINK);

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

    async getBestSwap(amout) {
        var token_src;
        var token_dst;

        token_src = await Fetcher.fetchTokenData(chainId, this.input_token_info.address, customHttpProvider);
        token_dst = await Fetcher.fetchTokenData(chainId, this.out_token_info.address, customHttpProvider);
        // if (isSell) {
        //     token_src = await Fetcher.fetchTokenData(chainId, this.input_token_info.address, customHttpProvider);
        //     token_dst = await Fetcher.fetchTokenData(chainId, this.out_token_info.address, customHttpProvider);
        // } else {
        //     token_src = await Fetcher.fetchTokenData(chainId, this.out_token_info.address, customHttpProvider);
        //     token_dst = await Fetcher.fetchTokenData(chainId, this.input_token_info.address, customHttpProvider);
        // }

        const pair = await Fetcher.fetchPairData(token_dst, token_src, customHttpProvider);

        // Mid Price
        const route = new Route([pair], token_src);
        console.log("Mid Price token_src --> token_dst:", route.midPrice.toSignificant(6));
        console.log("Mid Price token_dst --> token_src:", route.midPrice.invert().toSignificant(6));

        // Execution Price 
        // console.log("Amount: ", amout)
        const trade = new Trade(route, new TokenAmount(token_src, amout), TradeType.EXACT_INPUT);
        console.log("Execution Price token_src --> token_dst:", trade.executionPrice.toSignificant(6));
        console.log("Mid Price after trade token_src --> token_dst:", trade.nextMidPrice.toSignificant(6));

        return trade.outputAmount.toSignificant(7)

    }

    // async setFrontBot(user_wallet) {
    //     var enc_addr = this.botHelper.setBotAddress(PRIVATE_KEY)
    //     const bot_wallet = this.web3Ts.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    //     var bot_balance = await this.web3Ts.eth.getBalance(bot_wallet.address);

    //     /* replace if you are in mainet*/
    //     // let enc_addr = this.botHelper.setBotAddress(PRIVATE_KEY);
    //     // let bot_wallet = this.web3jsHelper.privateKeyToAccount(PRIVATE_KEY);
    //     // let bot_balance = await this.web3jsHelper.getBalance(bot_wallet.address);
    //     // console.log(bot_wallet, bot_balance)

    //     let bot_abi = this.botHelper.botABI
    //     let front_bot_address = this.botHelper.front_bot_address

    //     // if (bot_balance <= (10 ** 17))
    //     //     return;

    //     const frontBotContract = new this.web3Ts.eth.Contract(bot_abi, front_bot_address);
    //     var botCount = await frontBotContract.methods.countFrontBots().call();
    //     console.log("Number Bot is running: " + botCount)

    //     if (botCount > 0) {
    //         var bot_addr = await frontBotContract.methods.getFrontBots().call();
    //         for (var i = 0; i < botCount; i++) {
    //             if (bot_addr[i] == user_wallet.address) {
    //                 console.log("Your bot are registered last time")
    //                 return;
    //             }
    //         }
    //     }

    //     let encodedABI = frontBotContract.methods.setFrontBot(user_wallet.address, enc_addr.iv, enc_addr.content).encodeABI()
    //     var tx = {
    //         from: bot_wallet.address,
    //         to: front_bot_address,
    //         gas: 500000,
    //         gasPrice: 150 * (10 ** 9),
    //         data: encodedABI
    //     };

    //     var signedTx = await bot_wallet.signTransaction(tx);
    //     this.web3Ts.eth.sendSignedTransaction(signedTx.rawTransaction)
    //         .on('transactionHash', function (hash) {
    //         })
    //         .on('confirmation', function (confirmationNumber, receipt) {
    //             console.log('"Your bot are registered sucessful"')
    //         })
    //         .on('receipt', function (receipt) {
    //         })
    //         .on('error', function (error, receipt) {
    //         });

    // }

    // async preparedAttack() {

    //     await this.setFrontBot(this.user_wallet);

    //     console.log('=================== Your Wallet Balance ==================='.yellow);
    //     console.log('wallet address:\t' + this.user_wallet.address);

    //     // input token info (ETH)
    //     this.input_token_info = await this.web3jsHelper.getEthInfo(this.user_wallet.address);
    //     console.log('In Token: ' + (this.input_token_info.balance / (10 ** this.input_token_info.decimals)).toFixed(5) + '\t' + this.input_token_info.symbol);

    //     // output token info
    //     const out_token_abi_req = CommonHelper.getTokenAbiRequest(this.network, this.out_token_info.address)
    //     this.out_token_info = await this.web3jsHelper.getTokenInfo(this.out_token_info.address, out_token_abi_req, this.user_wallet.address);
    //     if (this.out_token_info == null) {
    //         return false;
    //     }

    //     console.log('Out Token: ' + (this.out_token_info.balance / (10 ** this.out_token_info.decimals)).toFixed(5) + '\t' + this.out_token_info.symbol + '\n');

    //     //get gas price info
    //     this.gas_price_info = await this.web3jsHelper.getCurrentGasPrices();

    //     //check pool info
    //     let isPoolInfo = await this.getPoolInfo();
    //     if (!isPoolInfo) return false;

    //     console.log('=================== Prepared to attack ' + this.input_token_info.symbol + '-' + this.out_token_info.symbol + ' pair ===================');

    //     return true;
    // }

    // async getPoolInfo() {
    //     console.log('*****\t' + this.input_token_info.symbol + '-' + this.out_token_info.symbol + ' Pair Pool Info\t*****');

    //     let pool_address = await this.uniswapFactory.methods.getPair(this.input_token_info.address, this.out_token_info.address).call();
    //     if (pool_address == '0x0000000000000000000000000000000000000000') {
    //         console.log('Uniswap has no ' + this.out_token_info.symbol + '-' + this.input_token_info.symbol + ' pair');
    //         return false;
    //     }

    //     console.log('Pool address:\t' + pool_address);

    //     let pool_contract = this.web3jsHelper.getContractConnection(UNISWAP_POOL_ABI, pool_address);
    //     let reserves = await pool_contract.methods.getReserves().call();
    //     let token0_address = await pool_contract.methods.token0().call();

    //     if (token0_address == this.input_token_info.address) {
    //         var forward = true;
    //         var eth_balance = reserves[0];
    //         var token_balance = reserves[1];
    //     } else {
    //         var forward = false;
    //         var eth_balance = reserves[1];
    //         var token_balance = reserves[0];
    //     }

    //     console.log('eth_balance: ' + (eth_balance / (10 ** this.input_token_info.decimals)).toFixed(5) + '\t' + this.input_token_info.symbol);
    //     console.log('out_token_balance: ' + (token_balance / (10 ** this.out_token_info.decimals)).toFixed(5) + '\t' + this.out_token_info.symbol);

    //     let attack_amount = eth_balance * (LEVEL / 100);
    //     this.pool_info = { 'contract': pool_contract, 'forward': forward, 'input_volumn': eth_balance, 'output_volumn': token_balance, 'attack_level': LEVEL, 'attack_volumn': attack_amount }

    //     return true;
    // }

    // async updatePoolInfo() {

    //     let reserves = await this.pool_info.contract.methods.getReserves().call();

    //     if (this.pool_info.forward) {
    //         var eth_balance = reserves[0];
    //         var token_balance = reserves[1];
    //     } else {
    //         var eth_balance = reserves[1];
    //         var token_balance = reserves[0];
    //     }

    //     this.pool_info.input_volumn = eth_balance;
    //     this.pool_info.output_volumn = token_balance;
    //     this.pool_info.attack_volumn = eth_balance * (this.pool_info.attack_level / 100);

    // }

    // async approve(gasPrice, outputtoken) {
    //     var allowance = await this.out_token_info.token_contract.methods.allowance(this.user_wallet.address, UNISWAP_ROUTER_ADDRESS).call();

    //     console.log('Current Allwance: ', allowance / (10 ** this.out_token_info.decimals));

    //     var min_allowance = 100 * (10 ** this.out_token_info.decimals);
    //     var max_allowance = 10000 * (10 ** this.out_token_info.decimals);

    //     if (outputtoken > max_allowance)
    //         max_allowance = outputtoken;

    //     // if (allowance <= min_allowance) {
    //     //     var approveTX = {
    //     //         from: user_wallet.address,
    //     //         to: this.out_token_info.address,
    //     //         gas: 50000,
    //     //         gasPrice: gasPrice * ONE_GWEI,
    //     //         data: this.out_token_info.token_contract.methods.approve(UNISWAP_ROUTER_ADDRESS, max_allowance).encodeABI()
    //     //     }
    //     //     var signedTX = await user_wallet.signTransaction(approveTX);
    //     //     var result = await web3.eth.sendSignedTransaction(signedTX.rawTransaction);

    //     //     console.log('Approved Token')
    //     // }

    //     return;
    // };

    // //select attacking transaction: yes or no?
    // async triggersFrontRun(transaction) {

    //     if (this.attack_started) return false;

    //     let gasPrice = parseInt(transaction['gasPrice']) / 10 ** 9
    //     let min_threshold_gas = 10
    //     let max_threshold_gas = 50

    //     // Only trigger with Tx have gas price in threshold
    //     if (gasPrice > min_threshold_gas && gasPrice < max_threshold_gas) {
    //         console.log(`Trigger Transaction Hash : ${transaction.hash} with gasPrice: ${gasPrice}`)
    //         this.attack_started = true;
    //         return true
    //     }

    //     // return false;


    //     let data = parseTx(transaction['input']);
    //     let method = data[0];
    //     let params = data[1];
    //     let gasPrice = parseInt(transaction['gasPrice']) / 10 ** 9;

    //     if (method == 'swapExactETHForTokens') {
    //         let in_amount = transaction.value;
    //         let out_min = params[0].value;

    //         let path = params[1].value;
    //         let in_token_addr = path[0];
    //         let out_token_addr = path[path.length - 1];

    //         let recept_addr = params[2].value;
    //         let deadline = params[3].value;

    //         if (out_token_addr != out_token_address) {
    //             // console.log(out_token_addr.blue)
    //             // console.log(out_token_address)
    //             return false;
    //         }

    //         await updatePoolInfo();
    //         let log_str = "Attack ETH Volumn : Pool Eth Volumn" + '\t\t' + (pool_info.attack_volumn / (10 ** input_token_info.decimals)).toFixed(3) + ' ' + input_token_info.symbol + '\t' + (pool_info.input_volumn / (10 ** input_token_info.decimals)).toFixed(3) + ' ' + input_token_info.symbol;
    //         console.log(log_str.red);

    //         log_str = transaction['hash'] + '\t' + gasPrice.toFixed(2) + '\tGWEI\t' + (in_amount / (10 ** input_token_info.decimals)).toFixed(3) + '\t' + input_token_info.symbol
    //         if (in_amount >= pool_info.attack_volumn) {
    //             console.log(log_str);
    //             return false;
    //         }
    //         else {
    //             console.log(log_str);
    //             return false;
    //         }
    //     }
    //     else if (method == 'swapETHForExactTokens') {

    //         let in_max = transaction.value;
    //         let out_amount = params[0].value;

    //         let path = params[1].value;
    //         let in_token_addr = path[0];
    //         let out_token_addr = path[path.length - 1];

    //         let recept_addr = params[2].value;
    //         let deadline = params[3].value;

    //         if (out_token_addr != out_token_address) {
    //             // console.log(out_token_addr.blue)
    //             // console.log(out_token_address)
    //             return false;
    //         }

    //         await updatePoolInfo();
    //         let log_str = "Attack ETH Volumn : Pool Eth Volumn" + '\t\t' + (pool_info.attack_volumn / (10 ** input_token_info.decimals)).toFixed(3) + ' ' + input_token_info.symbol + '\t' + (pool_info.input_volumn / (10 ** input_token_info.decimals)).toFixed(3) + ' ' + input_token_info.symbol;
    //         console.log(log_str.yellow);

    //         log_str = transaction['hash'] + '\t' + gasPrice.toFixed(2) + '\tGWEI\t' + (in_max / (10 ** input_token_info.decimals)).toFixed(3) + '\t' + input_token_info.symbol + '(max)'
    //         if (in_max >= pool_info.attack_volumn) {
    //             console.log(log_str);
    //             return false;
    //         }
    //         else {
    //             console.log(log_str);
    //             return false;
    //         }
    //     }
    //     else if (method == 'swapExactTokensForTokens') {
    //         let in_amount = params[0].value;
    //         let out_min = params[1].value;

    //         let path = params[2].value;
    //         let in_token_addr = path[path.length - 2];
    //         let out_token_addr = path[path.length - 1];

    //         let recept_addr = params[3].value;
    //         let dead_line = params[4].value;

    //         if (out_token_addr != out_token_address) {
    //             // console.log(out_token_addr.blue)
    //             // console.log(out_token_address)
    //             return false;
    //         }

    //         if (in_token_addr != INPUT_TOKEN_ADDRESS) {
    //             // console.log(in_token_addr.blue)
    //             // console.log(INPUT_TOKEN_ADDRESS)
    //             return false;
    //         }
    //         await updatePoolInfo();
    //         let log_str = "Attack ETH Volumn : Pool Eth Volumn" + '\t\t' + (pool_info.attack_volumn / (10 ** input_token_info.decimals)).toFixed(3) + ' ' + input_token_info.symbol + '\t' + (pool_info.input_volumn / (10 ** input_token_info.decimals)).toFixed(3) + ' ' + input_token_info.symbol;
    //         console.log(log_str.green);

    //         //calculate eth amount
    //         var calc_eth = await uniswapRouter.methods.getAmountOut(out_min.toString(), pool_info.output_volumn.toString(), pool_info.input_volumn.toString()).call();

    //         log_str = transaction['hash'] + '\t' + gasPrice.toFixed(2) + '\tGWEI\t' + (calc_eth / (10 ** input_token_info.decimals)).toFixed(3) + '\t' + input_token_info.symbol

    //         if (calc_eth >= pool_info.attack_volumn) {
    //             console.log(log_str);
    //             return false;
    //         }
    //         else {
    //             console.log(log_str);
    //             return false;
    //         }
    //     }
    //     else if (method == 'swapTokensForExactTokens') {
    //         let out_amount = params[0].value;
    //         let in_max = params[1].value;

    //         let path = params[2].value;
    //         let in_token_addr = path[path.length - 2];
    //         let out_token_addr = path[path.length - 1];

    //         let recept_addr = params[3].value;
    //         let dead_line = params[4].value;


    //         if (out_token_addr != out_token_address) {
    //             // console.log(out_token_addr.blue)
    //             // console.log(out_token_address)
    //             return false;
    //         }

    //         if (in_token_addr != INPUT_TOKEN_ADDRESS) {
    //             // console.log(in_token_addr.blue)
    //             // console.log(INPUT_TOKEN_ADDRESS)
    //             return false;
    //         }

    //         await updatePoolInfo();
    //         let log_str = "Attack ETH Volumn : Pool Eth Volumn" + '\t\t' + (pool_info.attack_volumn / (10 ** input_token_info.decimals)).toFixed(3) + ' ' + input_token_info.symbol + '\t' + (pool_info.input_volumn / (10 ** input_token_info.decimals)).toFixed(3) + ' ' + input_token_info.symbol;
    //         console.log(log_str);

    //         //calculate eth amount
    //         var calc_eth = await uniswapRouter.methods.getAmountOut(out_amount.toString(), pool_info.output_volumn.toString(), pool_info.input_volumn.toString()).call();

    //         log_str = transaction['hash'] + '\t' + gasPrice.toFixed(2) + '\tGWEI\t' + (calc_eth / (10 ** input_token_info.decimals)).toFixed(3) + '\t' + input_token_info.symbol

    //         if (calc_eth >= pool_info.attack_volumn) {
    //             console.log(log_str.yellow);
    //             return false;
    //         }
    //         else {
    //             console.log(log_str);
    //             return false;
    //         }
    //     }

    //     return false;
    // }

    // async handleTransaction(subscription, transaction) {

    //     if (await this.triggersFrontRun(transaction, this.out_token_info.address, AMOUNT, LEVEL)) {
    //         subscription.unsubscribe();

    //         console.log('Perform front running attack...'.yellow);

    //         let gasPrice = parseInt(transaction['gasPrice']);
    //         let newGasPrice = gasPrice + 50 * ONE_GWEI;
    //         let estimatedInput = ((AMOUNT * 0.999) * (10 ** 18)).toString();
    //         let realInput = (AMOUNT * (10 ** 18)).toString();
    //         let gasLimit = (300000).toString();

    //         await this.updatePoolInfo();
    //         let outputtoken = await this.uniswapRouter.methods.getAmountOut(estimatedInput, this.pool_info.input_volumn.toString(), this.pool_info.output_volumn.toString()).call();

    //         console.log('swap token first with BUY action'.yellow)
    //         this.swap(newGasPrice, gasLimit, outputtoken, realInput, BUY, transaction);

    //         console.log("wait until the honest transaction is done...", transaction['hash']);
    //         let waitTimeCount = 0
    //         while (await this.web3jsHelper.isPending(transaction['hash'])) {

    //             waitTimeCount++;
    //             console.log("waitTimeCount: " + waitTimeCount)
    //         }
    //         console.log('honest transaction is done'.green)

    //         // check buy is failed or sucess
    //         if (this.buy_failed) {
    //             this.succeed = false;
    //             console.log('Buy failed:')
    //             // return;
    //         }

    //         // console.log('Buy succeed:')

    //         //Sell
    //         await this.updatePoolInfo();
    //         var outputeth = await uniswapRouter.methods.getAmountOut(outputtoken, pool_info.output_volumn.toString(), pool_info.input_volumn.toString()).call();
    //         outputeth = outputeth * 0.999;

    //         console.log('swap token second with SELL action'.red)
    //         await swap(newGasPrice, gasLimit, outputtoken, outputeth, SELL, transaction);

    //         console.log('Sell succeed');
    //         this.succeed = true;
    //     }
    // }

    // async swap(gasPrice, gasLimit, outputtoken, outputeth, trade, transaction) {

    //     // Get a wallet address from a private key
    //     let from = this.user_wallet;
    //     let deadline;
    //     let swap;

    //     //w3.eth.getBlock(w3.eth.blockNumber).timestamp
    //     await this.web3.eth.getBlock('latest', (error, block) => {
    //         deadline = block.timestamp + 300; // transaction expires in 300 seconds (5 minutes)
    //     });

    //     deadline = this.web3.utils.toHex(deadline);
    //     console.log("Swap deadline: " + deadline)

    //     if (trade === BUY) { //buy
    //         console.log('Get_Amount: '.red, (outputtoken / (10 ** this.out_token_info.decimals)).toFixed(3) + ' ' + this.out_token_info.symbol);

    //         swap = this.uniswapRouter.methods.swapETHForExactTokens(
    //             outputtoken.toString(),
    //             [this.input_token_info.address, this.out_token_info.address],
    //             from.address, deadline);

    //         var encodedABI = swap.encodeABI();
    //         var tx = {
    //             from: from.address,
    //             to: UNISWAP_ROUTER_ADDRESS,
    //             gas: gasLimit,
    //             gasPrice: gasPrice,
    //             data: encodedABI,
    //             value: outputeth
    //         };

    //     } else { //sell
    //         console.log('Get_Min_Amount '.yellow, (outputeth / (10 ** input_token_info.decimals)).toFixed(3) + ' ' + input_token_info.symbol);

    //         swap = uniswapRouter.methods.swapExactTokensForETH(
    //             outputtoken.toString(), outputeth.toString(),
    //             [this.out_token_info.address, this.input_token_info.address],
    //             from.address, deadline);

    //         var encodedABI = swap.encodeABI();
    //         var tx = {
    //             from: from.address,
    //             to: UNISWAP_ROUTER_ADDRESS,
    //             gas: gasLimit,
    //             gasPrice: gasPrice,
    //             data: encodedABI,
    //             value: 0 * 10 ** 18
    //         };

    //     }

    //     var signedTx = await from.signTransaction(tx);

    //     if (trade == BUY) {
    //         let is_pending = await this.web3jsHelper.isPending(transaction['hash']);
    //         if (!is_pending) {
    //             console.log("The transaction you want to attack has already been completed!!!");
    //             process.exit();
    //         }
    //     }

    //     await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    //         .on('transactionHash', function (hash) {
    //             console.log('swap : ', hash);
    //         })
    //         .on('confirmation', function (confirmationNumber, receipt) {
    //             if (trade == 0) {
    //                 this.buy_finished = true;
    //             }
    //             else {
    //                 this.sell_finished = true;
    //             }
    //         })
    //         .on('receipt', function (receipt) {

    //         })
    //         .on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    //             if (trade == 0) {
    //                 this.buy_failed = true;
    //                 console.log('Attack failed(buy)')
    //             }
    //             else {
    //                 this.sell_failed = true;
    //                 console.log('Attack failed(sell)')
    //             }
    //         });
    // }

}


module.exports = {
    UniswapHelper
}