var BigNumber = require('big-number');


function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function getTokenAbiRequest(network, address) {
    return (network == 'mainnet') ?
        'https://api.etherscan.io/api?module=contract&action=getabi&address=' + address + '&apikey=33Y681VVRYXX7J2XCRX3CYYUSWPQ6EPQ9K' :
        'https://api-ropsten.etherscan.io/api?module=contract&action=getabi&address=' + address + '&apikey=33Y681VVRYXX7J2XCRX3CYYUSWPQ6EPQ9K';
}

function calculateProfit(cost, income) {
    return income - cost
}

function getAveragePrice(expected, orders) {
    let i = 0, size = 0, price = 0
    while (i < orders.length && size <= expected) {
        size += Number(orders[i][1])
        price += Number(orders[i][0])
        i++
    }
    return (price / i)
}

function parseAmountToStr(amount, decimals = 18) {
    // console.log('input - ', amount)
    let str = amount.toString()
    if (str.includes('e-')) {
        let f = str.split('e-')
        decimals = decimals - f[1]
        str = f[0]
    }
    let frags = str.split(".")
    if (frags.length == 2) {
        let fractions = frags[1]
        let integers = frags[0]
        fractions = fractions.length > decimals ? Math.ceil(fractions / 10 ** (fractions.length - decimals)) : fractions
        let zcount = decimals - fractions.length
        let zeros = '0'.repeat(zcount)
        let finalAmtStr = integers.concat(fractions, zeros)
        // console.log("Processed Amount - ", finalAmtStr)
        return finalAmtStr
    } else if (frags.length == 1) {
        // console.log("Processed Amount - ", str)
        return str
    } else {
        // console.error("invalid amount -" + amount)
        throw new Error("invalid amount -" + amount)
    }
}

function parseAmountToBigInt(amount, decimals = 18) {
    let bigint = parseAmountToStr(amount, decimals)
    return new BigNumber(bigint)
}

function readableBalance(preformattedAmount, decimals = 18) {
    let bn = new BigNumber(Number(preformattedAmount));
    let tokenUnit = new BigNumber(10);
    tokenUnit = tokenUnit.pow(-1 * decimals);
    return (bn.multipliedBy(tokenUnit)).toPrecision();
}

function getCurrentTime() {
    var currentdate = new Date();
    var datetime = "Last Sync: " + currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    return datetime;
}

module.exports = {
    millisToMinutesAndSeconds,
    getTokenAbiRequest,
    calculateProfit,
    getAveragePrice,
    parseAmountToStr,
    parseAmountToBigInt,
    readableBalance,
    getCurrentTime
}