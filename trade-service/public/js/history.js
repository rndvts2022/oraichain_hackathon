const socket = io();
const table_size = 5
let history_trades = new Array();

let url_history_trade = 'http://127.0.0.1:3000/tokenTradedPair/findByTimeAndLimit'

$(function () {
    /* init */
    // init()
    showViewSaleRevenue(undefined)
    getData({
        "time": "2022-06-30T13:05:34",
        "limit": 10
    })


    $("#load-more").click(function () {
        console.log(history_trades[history_trades.length - 1])
        let body = {
            "time": history_trades[history_trades.length - 1].created,
            "limit": 10
        };
        console.log(body)
        getData(body)
    });

});

function getData(body) {
    $.ajax({
        url: url_history_trade,
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(body),
        success: function (result) {
            let trades = result.result
            console.log("data: ", trades)
            trades.forEach(function (trade, i) {
                showViewCurrentSell(trade)
            });
        },
        error: function (err) {
            // check the err for error details
        }
    }); // ajax call closing
}

function showViewSaleRevenue(data) {
    $("#sale-revenue").empty();
    // console.log(data)
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

function showViewCurrentSell(data) {
    history_trades.push(data)

    $("#current-trade").empty()
    history_trades.forEach((trade, index) => {
        let rowView = viewSellFormat(trade.info, index + 1)
        $("#current-trade").append(rowView);
        sleep(100)
    });
}

function viewSellFormat(data, index) {
    let item;

    let profitColor;
    if (data.isProfit == 1) {
        profitColor = 'violet'
    } else if (data.isProfit == 0) {
        profitColor = 'green'
    } else if (data.isProfit == -1) {
        profitColor = 'red'
    }

    let actionColor, uniswap_payment
    if (data.action === "BUY") {
        actionColor = 'red'
        uniswap_payment = data.i
    } else if (data.action === "SELL") {
        actionColor = 'green'
        uniswap_payment = data.b2
    }

    item =
        `
        <tr>
            <td>${index}</td>
            <td>${data.time}</td>
            <td style="color: ${actionColor};">${data.action}</td>
            <td>${data.baseAmount}</td>
            <td>${data.q1}</td>
            <td>${uniswap_payment}</td>
            <td style="color: ${profitColor};">${data.pr}</td>
            <td style="color: red;">Not enough balance</td>
        </tr>
        `
    return item;
}
