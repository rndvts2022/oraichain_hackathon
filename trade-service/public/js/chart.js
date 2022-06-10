
$("#button-get-info").click(function () {

    $.ajax({
        url: "http://66.42.61.9:3000/tokenTradedPair/findByTimeAndLimit",
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
            createChart1("myChart1", trades);
            createChart2("myChart2", trades);
        },
        error: function (err) {
            // check the err for error details
        }
    }); // ajax call closing

});

function createChart1(chartID, trades) {

    prices = [];
    times = [];

    for (let i = 0; i < trades.length; i++) {

        if (trades[i].typeTrade == false) {

            if (prices.length < 15) {
                prices.push(trades[i].info.p)
                times.push(trades[i].created)
            } else {
                break;
            }
        }
    }

    console.log(chartID)
    const ctx = document.getElementById(chartID).getContext('2d');
    const DATA_COUNT = 7;
    const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times.reverse(),
            datasets: [
                {
                    label: 'Buy Kucoin - Sell Uniswap',
                    data: prices.reverse(),
                    borderColor: 'pink',
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
                times.push(trades[i].created)
            } else {
                break;
            }
        }
    }

    console.log(chartID)
    const ctx = document.getElementById(chartID).getContext('2d');
    const DATA_COUNT = 7;
    const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };
    const myChart = new Chart(ctx, {
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

$(function () {

    console.log("User connect..")
    var socket = io();
    socket.emit('connection-status', "thuan connected");
    console.log("User connected..")

    let current_time = new Date().toLocaleString();
    $("#current_time").text("Current Time " + current_time)

});

function formatDate(mydate) {

    let str = mydate;
    let date = moment(str);
    return date.format('llll');

    // const formated_Date = mydate;
    // const date = new Date(formated_Date) // formated_Date - SDK returned date

    // return `${date.getFullYear()}: ${date.getMonth() + 1}: ${date.getDay() + 1}: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

}