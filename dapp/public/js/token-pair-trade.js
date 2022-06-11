const server = 'http://localhost:3000/'
const socket = io(server);
const table_size = 5
let BuyUniswapSellKucoin_queue = new Queue();
let BuyKucoinSellUniswap_queue = new Queue();


$(function () {
    /* init */
    // showView_CurrentBalance(undefined)

    socket.emit('connection-status', "thuan connected");
    // socket.on('trade-info', function (data) {
    //     console.log(data)
    //     showView_CurrentBalance(data)
    // });

    // socket.on('token-pair-arbitrage', function (data) {
    //     console.log(data)
    //     if (data.typeTrade === "doBuyUniswapSellKucoin") {
    //         showView_DoBuyUniswapSellKucoin(data)
    //     } else if (data.typeTrade === 'doBuyKucoinSellUniswap') {
    //         showView_DoBuyKucoinSellUniswap(data)
    //     }
    //     // console.log(data.balanceAfterTrade)
    //     showView_CurrentBalance(data.balanceAfterTrade)
    // });

    let url_arbitrages = "http://66.42.61.9:3000/tokenTradedPair/findByTimeAndLimit";
    // let url_arbitrages = "http://localhost:3000/ai/pricePrediction"


    $.ajax({
        url: url_arbitrages,
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            "symbol": "ETH",
            "number_next_date": 3
        }),
        success: function (result) {
            let data = result.result.reverse()
            let buyUniswapSellKucoin = []
            let buyKucoinSellUniswap = []

            for (let i = 0; i < data.length; i++) {

                item = data[i];
                if (item.typeTrade === false) {

                    buyUniswapSellKucoin.push(item)
                    if (buyUniswapSellKucoin.length == 5) {
                        continue;
                    }
                    showView_DoBuyUniswapSellKucoin(item)

                } else if (item.typeTrade === true) {

                    console.log("hello: ", item)

                    buyKucoinSellUniswap.push(item)
                    if (buyKucoinSellUniswap.length == 5) {
                        continue;
                    }
                    showView_DoBuyKucoinSellUniswap(item)

                }

            }
        },
        error: function (err) {
            // check the err for error details
        }
    }); // ajax call closing

    // console.log(data.balanceAfterTrade)
    // showView_CurrentBalance(data.balanceAfterTrade)

});

function showView_CurrentBalance(data) {
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
            <img class="rounded-circle flex-shrink-0" width="20%" height="20%" src="img/uos.jpg" alt="UOS Token">
            <div class="ms-3">
                <p class="mb-2">Kucoin wallet</p>
                <h6 ${flash}>${data.kucoinBaseToken} UOS</h6>
            </div>
        </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
                <img class="rounded-circle flex-shrink-0" width="20%" height="20%" src="img/usdt.jpg" alt="UOS Token">
                <div class="ms-3">
                    <p class="mb-2">Kucoin wallet</p>
                    <h6 ${flash}>${data.kucoinQuoteToken} USDT</h6>
                </div>
            </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
                <img class="rounded-circle flex-shrink-0" width="20%" height="20%" src="img/uos.jpg" alt="UOS Token">
                <div class="ms-3">
                    <p class="mb-2">My wallet</p>
                    <h6 ${flash}>${data.walletBaseToken} UOS</h6>
                </div>
            </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
                <img class="rounded-circle flex-shrink-0" width="20%" height="20%" src="img/usdt.jpg" alt="UOS Token">
                <div class="ms-3">
                    <p class="mb-2">My wallet</p>
                    <h6 ${flash}>${data.walletQuoteToken} USDT</h6>
                </div>
            </div>
        </div>`
    )
}

function showView_DoBuyUniswapSellKucoin(data) {
    BuyUniswapSellKucoin_queue.enqueue(data);
    if (BuyUniswapSellKucoin_queue.size() === table_size) {
        BuyUniswapSellKucoin_queue.dequeue()
    }

    console.log("Comming home")

    let items = BuyUniswapSellKucoin_queue.items.reverse();
    $("#current-sell").empty()
    items.forEach((item, index) => {
        let rowView = ViewFormat_DoBuyUniswapSellKucoin(item, index)
        $("#current-sell").append(rowView);
        sleep(100)
    });
    BuyUniswapSellKucoin_queue.items.reverse();
}

function ViewFormat_DoBuyUniswapSellKucoin(data, index) {

    let create_time = data.created
    data = data.info
    data.time = convertUTCDateToLocalDate(create_time)

    let item;
    let flash = ''
    if (index === 0) {
        flash = `class="thuan-flash"`
    }
    if (data.isExecution == true) {
        item =
            `
            <tr>
                <td>${data.time}</td>
                <td>${data.b1}</td>
                <td>${data.g}</td>
                <td>${data.M1}</td>
                <td>${data.P1}}</td>
                <td>${data.M2}</td>
                <td>${data.P2}</td>
                <td>${data.p}</td>
                <td style="color: green;">${`Yes`}</td>
            </tr>
        `
    } else if (data.isExecution == false) {
        item =
            `
            <tr>
                <td>${data.time}</td>
                <td>${data.b1}</td>
                <td>${data.g}</td>
                <td>${data.M1}</td>
                <td>${data.P1}</td>
                <td>${data.M2}</td>
                <td>${data.P2}</td>
                <td>${data.p}</td>
                <td style="color: red;">${`No`}</td>
            </tr>
        `
    }
    return item;
}

function showView_DoBuyKucoinSellUniswap(data) {
    console.log(data)


    BuyKucoinSellUniswap_queue.enqueue(data);
    if (BuyKucoinSellUniswap_queue.size() === table_size) {
        BuyKucoinSellUniswap_queue.dequeue()
    }

    let items = BuyKucoinSellUniswap_queue.items.reverse();
    $("#current-buy").empty()
    items.forEach((item, index) => {
        let rowView = ViewFormat_DoBuyKucoinSellUniswap(item, index)
        $("#current-buy").append(rowView);
        sleep(100)
    });
    BuyKucoinSellUniswap_queue.items.reverse();
}

function ViewFormat_DoBuyKucoinSellUniswap(data, index) {

    let create_time = data.created
    data = data.info
    data.time = convertUTCDateToLocalDate(create_time)

    let item;
    let flash = ''
    if (index === 0) {
        flash = `class="thuan-flash"`
    }

    console.log(data.time)
    if (data.isExecution == true) {
        item =
            `
            <tr>
                <td>${data.time}</td>
                <td>${data.b1}</td>
                <td>${data.g}</td>
                <td>${data.M1}</td>
                <td>${data.P1}</td>
                <td>${data.M2}</td>
                <td>${data.P2}</td>
                <td>${data.p}</td>
                <td style="color: green;">${`Yes`}</td>
            </tr>
        `
    } else if (data.isExecution == false) {
        item =
            `
            <tr>
                <td>${data.time}</td>
                <td>${data.b1}</td>
                <td>${data.g}</td>
                <td>${data.M1}</td>
                <td>${data.P1}</td>
                <td>${data.M2}</td>
                <td>${data.P2}</td>
                <td>${data.p}</td>
                <td style="color: red;">${`No`}</td>
            </tr>
        `
    }
    return item;
}

function convertUTCDateToLocalDate(date_to_convert_str) {
    let date = new Date(date_to_convert_str)
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate.toJSON().slice(0, 19);
}