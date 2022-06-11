
var myChart1, myChart2;
$("#button-get-info").click(function () {

    // let url_arbitrages = "http://66.42.61.9:3000/tokenTradedPair/findByTimeAndLimi";
    let url_arbitrages = "http://localhost:3002/arbitrage/findByTime"

    clearCharts()
    $("#loader").show()
    $.ajax({
        url: url_arbitrages,
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            "time": "2022-06-30T13:05:34",
            "limit": 10,
            "exchanges_id": 1,
            "typeTrade": "1"
        }),
        success: function (result) {
            let trades = result.result
            console.log(trades)

            $("#arbitrages-chart").show()
            createChart1("myChart1", trades);
            createChart2("myChart2", trades);
            $("#loader").hide()
        },
        error: function (err) {
            $("#loader").hide()
            // check the err for error details
        }
    }); // ajax call closing

});

function createChart1(chartID, trades) {

    prices = [];
    times = [];

    for (let i = 0; i < trades.length; i++) {

        if (trades[i].typeTrade == true) {

            if (prices.length < 15) {
                prices.push(trades[i].info.p)
                times.push(formatDate(convertUTCDateToLocalDate(trades[i].created)))
            } else {
                break;
            }
        }
    }

    console.log(chartID)
    const ctx = document.getElementById(chartID).getContext('2d');
    const DATA_COUNT = 7;
    const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };
    myChart1 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times.reverse(),
            datasets: [
                {
                    label: 'Buy Kucoin - Sell Uniswap',
                    data: prices.reverse(),
                    borderColor: 'red',
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            }
        }
    });
}

function createChart2(chartID, trades) {

    prices = [];
    times = [];

    for (let i = 0; i < trades.length; i++) {

        if (trades[i].typeTrade == false) {

            if (prices.length < 15) {
                prices.push(trades[i].info.p)
                times.push(formatDate(convertUTCDateToLocalDate(trades[i].created)))
            } else {
                break;
            }
        }
    }

    console.log(chartID)
    const ctx = document.getElementById(chartID).getContext('2d');
    const DATA_COUNT = 7;
    const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };
    myChart2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times.reverse(),
            datasets: [
                {
                    label: 'Buy Uniswap - Sell Kucoin',
                    data: prices.reverse(),
                    borderColor: 'blue',
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            }
        }
    });
}

function clearCharts() {
    if (myChart1 != null) {
        myChart1.destroy();
    }

    if (myChart2 != null) {
        myChart2.destroy();
    }
}

$(function () {

    console.log("User connect..")
    var socket = io();
    socket.emit('connection-status', "thuan connected");
    console.log("User connected..")

    let current_time = new Date().toLocaleString();
    $("#current_time").text("Current Time " + current_time)

    $("#loader").hide()
    $("#arbitrages-chart").hide()

});

function formatDate(str) {

    // console.log(str.substring(0,10) + " " + str.substring(11, 19));
    // return str.substring(0,10) + " " + str.substring(11, 19);
    return str.substring(11, 19);

}

function convertUTCDateToLocalDate(date_to_convert_str) {
    let date = new Date(date_to_convert_str)
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate.toJSON().slice(0, 19);
}

