const socket = io();
const table_size = 5
let sell_queue = new Queue();
let buy_queue = new Queue();


$(function () {
    /* init */
    showViewSaleRevenue(undefined)
    showViewKucoinPrice(undefined, 0)

    socket.emit('connection-status', "thuan connected");
    // socket.on('trade-info', function (data) {
    //     console.log(data)
    //     showViewSaleRevenue(data)
    // });
    socket.on('market-price', function (prices) {
        console.log(prices)
        $("#market-price").empty();
        prices.forEach(function (price, i) {
            showViewKucoinPrice(price, i)
        });
    });
    socket.on('trade-action', function (data) {
        console.log(data)
        if (data.action === 'SELL') {
            showViewCurrentSell(data)
        } else if (data.action === 'BUY') {
            showViewCurrentBuy(data)
        }
        // console.log(data.balanceAfterTrade)
        showViewSaleRevenue(data.balanceAfterTrade)
    });
});

function showViewSaleRevenue(data) {
    $("#sale-revenue").empty();
    console.log(data)
    if (data == undefined) {
        data = {
            'walletBaseToken': 0,
            'walletQuoteToken': 0,
            'kucoinBaseToken': 0,
            'kucoinQuoteToken': 0
        }
    }
    let flash = `class="thuan-flash" style="color: green;"`;
    $("#sale-revenue").append(
        `<div class="col-sm-6 col-xl-3">
        <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
            <i class="fa fa-chart-line fa-3x text-primary"></i>
            <div class="ms-3">
                <p class="mb-2">Kucoin base token</p>
                <h6 ${flash}>${data.kucoinBaseToken} ETH</h6>
            </div>
        </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
                <i class="fa fa-chart-bar fa-3x text-primary"></i>
                <div class="ms-3">
                    <p class="mb-2">Kucoin quote token</p>
                    <h6 ${flash}>${data.kucoinQuoteToken} USDT</h6>
                </div>
            </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
                <i class="fa fa-chart-area fa-3x text-primary"></i>
                <div class="ms-3">
                    <p class="mb-2">Wallet base token</p>
                    <h6 ${flash}>${data.walletBaseToken} ETH</h6>
                </div>
            </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
                <i class="fa fa-chart-pie fa-3x text-primary"></i>
                <div class="ms-3">
                    <p class="mb-2">Wallet quote token</p>
                    <h6 ${flash}>${data.walletQuoteToken} USDT</h6>
                </div>
            </div>
        </div>`
    )
}

function showViewKucoinPrice(price, index) {

    if (price == undefined) {
        return;
    }

    $("#market-price").append(
        `
        <tr>
            <td>${index}</td>
            <td><img style="width: 10%;" src="${price.image}" /><span class="text-warning"> ${price.tokenName}</span></td>
            <td>${price.symbol}</td>
            <td class="text-warning">$${price.price}</td>
            <td class="text-success">%5.54 <i class="fa fa-arrow-up"></i></td>
        </tr> 
        `
    )
}

function showViewCurrentSell(data) {
    sell_queue.enqueue(data);
    if (sell_queue.size() === table_size) {
        sell_queue.dequeue()
    }

    let items = sell_queue.items.reverse();
    $("#current-sell").empty()
    items.forEach((item, index) => {
        let rowView = viewSellFormat(item, index)
        $("#current-sell").append(rowView);
        sleep(100)
    });
    sell_queue.items.reverse();
}

function showViewCurrentBuy(data) {

    buy_queue.enqueue(data);
    if (buy_queue.size() === table_size) {
        buy_queue.dequeue()
    }

    let items = buy_queue.items.reverse();
    $("#current-buy").empty()
    items.forEach((item, index) => {
        let rowView = viewBuyFormat(item, index)
        $("#current-buy").append(rowView);
        sleep(100)
    });
    buy_queue.items.reverse();
}

function viewSellFormat(data, index) {
    let item;
    let flash = ''
    if (index === 0) {
        flash = `class="thuan-flash"`
    }
    if (data.isProfit == 1) {
        item =
            `
        <tr>
            <td ${flash}>${data.time}</td>
            <td><a class="btn btn-sm btn-primary">${data.action}</a></td>
            <td>${data.baseAmount}</td>
            <td>${data.P}</td>
            <td>${data.kFee}</td>
            <td>${data.q1}</td>
            <td>${data.cg}-> ${data.txFees}</td>
            <td>${data.totalSwap}</td>
            <td>${data.b2}</td>
            <td style="color: violet;">${data.pr}</td>
            <td style="color: red;">Not enough balance</td>
        </tr>
        `
    } else if (data.isProfit == 0) {
        item =
            `
        <tr>
            <td ${flash}>${data.time}</td>
            <td><a class="btn btn-sm btn-primary">${data.action}</a></td>
            <td>${data.baseAmount}</td>
            <td>${data.P}</td>
            <td>${data.kFee}</td>
            <td>${data.q1}</td>
            <td>${data.cg}-> ${data.txFees}</td>
            <td>${data.totalSwap}</td>
            <td>${data.b2}</td>
            <td style="color: green;">${data.pr}</td>
            <td style="color: red;">Not enough balance</td>
        </tr>
        `
    } else if (data.isProfit == -1) {
        item =
            `
        <tr>
            <td ${flash}>${data.time}</td>
            <td><a class="btn btn-sm btn-primary">${data.action}</a></td>
            <td>${data.baseAmount}</td>
            <td>${data.P}</td>
            <td>${data.kFee}</td>
            <td>${data.q1}</td>
            <td>${data.cg}-> ${data.txFees}</td>
            <td>${data.totalSwap}</td>
            <td>${data.b2}</td>
            <td style="color: red;">${data.pr}</td>
            <td style="color: red;">Not enough balance</td>
        </tr>
        `
    }
    return item;
}

function viewBuyFormat(data, index) {
    let item;
    let flash = ''
    if (index === 0) {
        flash = `class="thuan-flash"`
    }
    if (data.isProfit == 1) {
        item =
            `
        <tr>
            <td ${flash}>${data.time}</td>
            <td><a class="btn btn-sm btn-primary">${data.action}</a></td>
            <td>${data.baseAmount}</td>
            <td>${data.P}</td>
            <td>${data.kFee}</td>
            <td>${data.q1}</td>
            <td>${data.cg}->  ${data.g} -> ${data.txFees}</td>
            <td>${data.b2}</td>
            <td>${data.i}</td>
            <td style="color: violet;">${data.pr}</td>
            <td style="color: red;">Not enough balance</td>
        </tr>
        `
    } else if (data.isProfit == 0) {
        item =
            `
        <tr>
            <td ${flash}>${data.time}</td>
            <td><a class="btn btn-sm btn-primary">${data.action}</a></td>
            <td>${data.baseAmount}</td>
            <td>${data.P}</td>
            <td>${data.kFee}</td>
            <td>${data.q1}</td>
            <td>${data.cg}->  ${data.g} -> ${data.txFees}</td>
            <td>${data.b2}</td>
            <td>${data.i}</td>
            <td style="color: green;">${data.pr}</td>
            <td style="color: red;">Not enough balance</td>
        </tr>
        `
    } else if (data.isProfit == -1) {
        item =
            `
        <tr>
            <td ${flash}>${data.time}</td>
            <td><a class="btn btn-sm btn-primary">${data.action}</a></td>
            <td>${data.baseAmount}</td>
            <td>${data.P}</td>
            <td>${data.kFee}</td>
            <td>${data.q1}</td>
            <td>${data.cg}->  ${data.g} -> ${data.txFees}</td>
            <td>${data.b2}</td>
            <td>${data.i}</td>
            <td style="color: red;">${data.pr}</td>
            <td style="color: red;">Not enough balance</td>
        </tr>
        `
    }
    return item;
}