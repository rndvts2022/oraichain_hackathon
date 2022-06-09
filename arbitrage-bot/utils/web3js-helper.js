var Web3 = require('web3');
var axios = require('axios');
const abiDecoder = require('abi-decoder');
const colors = require('colors');

class Web3jsHelper {
    constructor(http_provider_link, ethgasAPI, network) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(http_provider_link));
        this.ethgasAPI = ethgasAPI
        this.network = network /* 'mainnet' 'mumbai' */
    }

    // get current gas price
    async getCurrentGasPrices() {
        let response = await axios.get(this.ethgasAPI)
        let prices = {
            low: response.data.safeLow / 10,
            medium: response.data.average / 10,
            high: response.data.fast / 10
        }

        return prices;
    }

    getTokenAbiRequest(network, address) {
        return (network == 'mainnet') ?
            'https://api.etherscan.io/api?module=contract&action=getabi&address=' + address + '&apikey=33Y681VVRYXX7J2XCRX3CYYUSWPQ6EPQ9K' :
            'https://api-ropsten.etherscan.io/api?module=contract&action=getabi&address=' + address + '&apikey=33Y681VVRYXX7J2XCRX3CYYUSWPQ6EPQ9K';
    }

    // get Token ERC20 info of user wallet
    async getTokenInfo(tokenAddr, token_abi_ask, address) {
        //get token abi
        let response = await axios.get(token_abi_ask);
        if (response.data.status == 0) {
            console.log('Invalid Token Address !')
            return null;
        }

        let token_abi = response.data.result;

        //get token info
        let token_contract = new this.web3.eth.Contract(JSON.parse(token_abi), tokenAddr);

        let balance = await token_contract.methods.balanceOf(address).call();
        let decimals = await token_contract.methods.decimals().call();
        let symbol = await token_contract.methods.symbol().call();

        return { 'address': tokenAddr, 'balance': balance, 'symbol': symbol, 'decimals': decimals, 'abi': token_abi, 'token_contract': token_contract }
    }


    async getEthInfo(address) {

        let weth_token_address = (this.network == 'mainnet') ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' : '0xc778417E063141139Fce010982780140Aa0cD5Ab';

        let balance = await this.web3.eth.getBalance(address);
        let decimals = 18;
        let symbol = 'ETH';

        return { 'address': weth_token_address, 'balance': balance, 'symbol': symbol, 'decimals': decimals, 'abi': null, 'token_contract': null }
    }

    // get connection to network (Ethereum, Testnet...)
    getWeb3jsConnection(http_provider_link) {
        return new Web3(new Web3.providers.HttpProvider(http_provider_link));
    }

    // connect smart contract
    getContractConnection(router_abi, contract_address) {
        return new this.web3.eth.Contract(router_abi, contract_address);
    }

    // create account from privateKey
    privateKeyToAccount(privateKey) {
        return this.web3.eth.accounts.privateKeyToAccount(privateKey);
    }

    // get balance of account (input address)
    async getBalance(address) {
        return await this.web3.eth.getBalance(address);
    }

    // sign transaction: do this before send transaction to Blockchain Network
    async signTransaction(approveTX) {
        return await user_wallet.signTransaction(approveTX);
    }

    // send signed transaction to Ethereum Network (in mempool first)
    async sendSignedTransaction(signedTX) {
        return await this.web3.eth.sendSignedTransaction(signedTX.rawTransaction)
    }

    // get tracsaction info from Blockchain
    async getTransaction(transactionHash) {
        return await this.web3.eth.getTransaction(transactionHash);
    }

    // check tracsaction is in mempool or confirmed?
    async isPending(transactionHash) {
        return await this.web3.eth.getTransactionReceipt(transactionHash) == null;
    }

    parseTx(input) {
        if (input == '0x')
            return ['0x', []]
        let decodedData = abiDecoder.decodeMethod(input);
        let method = decodedData['name'];
        let params = decodedData['params'];

        return [method, params]
    }

}




module.exports = {
    Web3jsHelper
}