
const ccxt = require('ccxt')
const moment = require('moment')
const delay = require('delay')

class KucoinHelper {
    constructor(config, pairTokens) {
        this.pairTokens = pairTokens //'BTC/USDT'

        this.kucoin = new ccxt.kucoin({
            'apiKey': config.apiKey,
            'secret': config.secret,
            'password': config.password
        })
    }

    async getOrderBook(maxOrderBookLimit, ) {
        const exchange = new ccxt.kucoin({
            enableRateLimit: true, // required https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
        })
        const pairTokens = this.pairTokens
        const orderbook = await this.kucoin.fetchOrderBook(pairTokens, maxOrderBookLimit)

        // limit it to maxOrderBookLimit bids and 5 asks
        const limitedOrderbook = {
            'asks': orderbook['asks'].slice(0, maxOrderBookLimit),
            'bids': orderbook['bids'].slice(0, maxOrderBookLimit),
            'nonce': orderbook['nonce'],
            'timestamp': moment(orderbook['timestamp']).format(),
            'datetime': moment(orderbook['datetime']).format(),
        }
        // console.log("asks:", limitedOrderbook.asks)
        // console.log("bids:", limitedOrderbook.bids)

        return limitedOrderbook
    }

    async fetchBalance() {
        return await this.kucoin.fetchBalance()
    }

    // async getAveragesPrices(prices) {

    //     prices.forEach(price => {
    //         console.log(price[0])
    //     });
    // }

    getAveragePrice(expected, orders) {
        let i = 0, size = 0, price = 0
        while (i < orders.length && size <= expected) {
            size += Number(orders[i][1])
            price += Number(orders[i][0])
            i++
        }
        return (price / i)
    }

    // async getAveragesPrices(maxOrderBookLimit) {
    //     const prices = await this.kucoin.fetchOHLCV(this.pairTokens, "1m", undefined, maxOrderBookLimit)
    //     const bPrices = prices.map(price => {
    //         return {
    //             timestamp: moment(price[0]).format(),
    //             open: price[1],
    //             high: price[2],
    //             low: price[3],
    //             close: price[4],
    //             volume: price[5],
    //         }
    //     })
    //     // console.log(bPrices)

    //     const averagePrices = bPrices.reduce((acc, price) => acc + price.close, 0) / maxOrderBookLimit
    //     const lastPrice = bPrices[bPrices.length - 1].close
    //     // console.log(bPrices.map(p => p.close), averagePrices, lastPrice)

    //     // const direction = averagePrices > lastPrice ? "buy" : "sell"
    //     // const TRADE_SIZE = 0
    //     // const quanlity = TRADE_SIZE / lastPrice

    //     console.log(`Average price: ${averagePrices}. Last price: ${lastPrice}`)
    //     // const order = await kucoin.createMarketOrder("BTC/USDT", direction, quanlity)
    //     // console.log(`${moment().format()}: ${direction} ${quanlity} BTC at ${lastPrice}`)
    //     // printBalance(lastPrice)
    //     // console.log(order, '\n')
    // }
}

module.exports = {
    KucoinHelper
}



// const ccxt = require('ccxt')
// const moment = require('moment')
// const delay = require('delay')

// async function orderBook() {
//     const exchange = new ccxt.kucoin({
//         enableRateLimit: true, // required https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
//     })
//     const symbol = 'BTC/USDT'
//     const fetchOrderBookLimit = 20
//     const maxOrderBookLimit = 5
//     const orderbook = await exchange.fetchOrderBook(symbol, fetchOrderBookLimit)
//     // limit it to 5 bids and 5 asks
//     const limitedOrderbook = {
//         'asks': orderbook['asks'].slice(0, maxOrderBookLimit),
//         'bids': orderbook['bids'].slice(0, maxOrderBookLimit),
//         'nonce': orderbook['nonce'],
//         'timestamp': moment(orderbook['timestamp']).format(),
//         'datetime': moment(orderbook['datetime']).format(),
//     }
//     console.log(limitedOrderbook)
// }

// orderBook()

// const kucoin = new ccxt.kucoin({
//     'apiKey': '620281f358ec5000012ce685',
//     'secret': 'e75933e0-ed14-45ef-8217-5325a6ee4ee6',
//     'password': 'Buiquangthuan1'
// })

// // kucoin.setSandboxMode(true)

// async function printBalance(btcPrice) {
//     const balance = await kucoin.fetchBalance()
//     const total = balance.total
//     console.log(`Balance: ${total.BTC} BTC , ${total.USDT} USDT `)
//     console.log(`Total USDT: ${total.BTC * btcPrice + total.USDT} \n`)
// }

// async function tick() {

//     const prices = await kucoin.fetchOHLCV('BTC/USDT', "1m", undefined, 5)
//     const bPrices = prices.map(price => {
//         return {
//             timestamp: moment(price[0]).format(),
//             open: price[1],
//             high: price[2],
//             low: price[3],
//             close: price[4],
//             volume: price[5],
//         }
//     })
//     // console.log(bPrices)

//     const averagePrices = bPrices.reduce((acc, price) => acc + price.close, 0) / 5
//     const lastPrice = bPrices[bPrices.length - 1].close
//     console.log(bPrices.map(p => p.close), averagePrices, lastPrice)

//     const direction = averagePrices > lastPrice ? "buy" : "sell"
//     const TRADE_SIZE = 0
//     const quanlity = TRADE_SIZE / lastPrice

//     console.log(`Average price: ${averagePrices}. Last price: ${lastPrice}`)
//     // const order = await kucoin.createMarketOrder("BTC/USDT", direction, quanlity)
//     console.log(`${moment().format()}: ${direction} ${quanlity} BTC at ${lastPrice}`)
//     printBalance(lastPrice)
//     // console.log(order, '\n')
// }

// // async function main() {
// //     while (true) {
// //         await tick()
// //         await delay(10 * 1000)
// //     }
// // }

// // main()

