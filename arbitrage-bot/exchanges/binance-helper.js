const ccxt = require('ccxt')
const moment = require('moment')
const delay = require('delay')
// console.log(ccxt.exchanges) // print all available exchanges

const binance = new ccxt.binance({
    'apiKey': 'eHaS2ZbC0LZDlwZhL5MA0yEapl9BZWLV8QhrAboqQHOtyAutB6mH8872IzgDFb1r',
    'secret': 'SRiAFRilSqeCtOTt9bkqihSdW7c7EnkF4MPlz3eeVNDjvmPzHqwdzrW7sNXBlBp7',
})
// binance.setSandboxMode(true)

async function printBalance(btcPrice) {
    const balance = await binance.fetchBalance()
    const total = balance.total
    console.log(`Balance: ${total.BTC} BTC , ${total.USDT} USDT `)
    console.log(`Total USDT: ${total.BTC * btcPrice + total.USDT} \n`)
}

async function tick() {
    const binance = new ccxt.binance({
        'apiKey': 'eHaS2ZbC0LZDlwZhL5MA0yEapl9BZWLV8QhrAboqQHOtyAutB6mH8872IzgDFb1r',
        'secret': 'SRiAFRilSqeCtOTt9bkqihSdW7c7EnkF4MPlz3eeVNDjvmPzHqwdzrW7sNXBlBp7',
    })
    // binance.setSandboxMode(true)

    const prices = await binance.fetchOHLCV('BTC/USDT', "1m", undefined, 5)
    const bPrices = prices.map(price => {
        return {
            timestamp: moment(price[0]).format(),
            open: price[1],
            high: price[2],
            low: price[3],
            close: price[4],
            volume: price[5],
        }
    })
    // console.log(bPrices)

    const averagePrices = bPrices.reduce((acc, price) => acc + price.close, 0) / 5
    const lastPrice = bPrices[bPrices.length - 1].close
    console.log(bPrices.map(p => p.close), averagePrices, lastPrice)

    const direction = averagePrices > lastPrice ? "buy" : "sell"
    const TRADE_SIZE = 0
    const quanlity = TRADE_SIZE / lastPrice

    console.log(`Average price: ${averagePrices}. Last price: ${lastPrice}`)
    // const order = await binance.createMarketOrder("BTC/USDT", direction, quanlity)
    console.log(`${moment().format()}: ${direction} ${quanlity} BTC at ${lastPrice}`)
    printBalance(lastPrice)
    // console.log(order, '\n')
}

async function main() {
    while (true) {
        await tick()
        await delay(10 * 1000)
    }
}

main()

async function ticktok() {
    // let kraken = new ccxt.kraken()
    // let bitfinex = new ccxt.bitfinex({ verbose: true })
    // let huobipro = new ccxt.huobipro()
    // let okcoinusd = new ccxt.okcoin({
    //     apiKey: 'YOUR_PUBLIC_API_KEY',
    //     secret: 'YOUR_SECRET_PRIVATE_KEY',
    // })

    // const exchangeId = 'binance'
    //     , exchangeClass = ccxt[exchangeId]
    //     , exchange = new exchangeClass({
    //         'apiKey': 'eHaS2ZbC0LZDlwZhL5MA0yEapl9BZWLV8QhrAboqQHOtyAutB6mH8872IzgDFb1r',
    //         'secret': 'SRiAFRilSqeCtOTt9bkqihSdW7c7EnkF4MPlz3eeVNDjvmPzHqwdzrW7sNXBlBp7',
    //     })

    // console.log(kraken.id, await kraken.loadMarkets())
    // console.log(bitfinex.id, await bitfinex.loadMarkets())
    // console.log(huobipro.id, await huobipro.loadMarkets())

    // console.log(kraken.id, await kraken.fetchOrderBook(kraken.symbols[0]))
    // console.log(bitfinex.id, await bitfinex.fetchTicker('BTC/USD'))
    // console.log(huobipro.id, await huobipro.fetchTrades('ETH/USDT'))

    // console.log(okcoinusd.id, await okcoinusd.fetchBalance())

    // sell 1 BTC/USD for market price, sell a bitcoin for dollars immediately
    // console.log(okcoinusd.id, await okcoinusd.createMarketSellOrder('BTC/USD', 1))

    // buy 1 BTC/USD for $2500, you pay $2500 and receive ฿1 when the order is closed
    // console.log(okcoinusd.id, await okcoinusd.createLimitBuyOrder('BTC/USD', 1, 2500.00))

    // pass/redefine custom exchange-specific order params: type, amount, price or whatever
    // use a custom order type
    bitfinex.createLimitSellOrder('BTC/USD', 1, 10, { 'type': 'trailing-stop' })

}