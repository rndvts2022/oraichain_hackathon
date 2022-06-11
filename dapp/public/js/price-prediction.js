
var selected_coin_value = 0;
var myChart;

$("#button-get-info").click(function () {

    // let url_arbitrages = "http://66.42.61.9:8002/coin-predict/eth";
    let url_arbitrages = "http://localhost:3002/ai/pricePrediction"

    $("#loader").show()
    clearChart1("myChart1")

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
            let data = getDataBySelectedCoin(selected_coin_value, result.result)
            // console.log(data)
            createChart1("myChart1", data);
            $("#loader").hide();
            $("#prediction-chart").show();
        },
        error: function (err) {
            // check the err for error details
        }
    }); // ajax call closing

});

function createChart1(chartID, data) {

    price_orgigin_chart = [

    ];

    price_chart = [];
    times = [];

    last_prices = data.prices
    last_timeline = data.timeline

    prediction_prices = []
    for (let i = 0; i < last_prices.length; i++) {
        if (i == last_prices.length - 1) {
            prediction_prices.push(last_prices[i])
        } else {
            prediction_prices.push(null)
        }
    }

    prediction_prices.push(data.prediction.predicted_price_1)
    prediction_prices.push(data.prediction.predicted_price_2)
    prediction_prices.push(data.prediction.predicted_price_3)
    prediction_prices.push(data.prediction.predicted_price_4)
    prediction_prices.push(data.prediction.predicted_price_5)

    let next_days = getDays(5)

    last_timeline.push(next_days[0])
    last_timeline.push(next_days[1])
    last_timeline.push(next_days[2])

    console.log(chartID)
    const ctx = document.getElementById(chartID).getContext('2d');
    const DATA_COUNT = 7;
    const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last_timeline,
            datasets: [
                {
                    label: ' History Price',
                    data: last_prices,
                    borderColor: '#FFE0B2',
                    fill: true,
                    backgroundColor: '#FFE0B2'
                },
                {
                    label: ' Prediction Price',
                    data: prediction_prices,
                    borderColor: '#DDBAE3',
                    fill: true,
                    backgroundColor: '#DDBAE3'
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

function clearChart1() {
    if (myChart != null) {
        myChart.destroy();
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
    $("#prediction-chart").hide()



});

function changeSelectedCoin() {
    selected_coin_value = document.getElementById("selected-coin").value;
    console.log(selected_coin_value)

    if (selected_coin_value == 0) {
        $("#chart-title").text("History and Price Prediction Ethrerum (ETH)")
    }
    else if (selected_coin_value == 1) {
        $("#chart-title").text("History and Price Prediction Bitcoin (BTC)")
    } else {
        $("#chart-title").text("History and Price Prediction Ethrerum (ETH)")
    }

}

function getDataBySelectedCoin(selected, data) {

    if (selected == 0) {
        $("#chart-title").text("History and Price Prediction Ethrerum (ETH)")
        return data.eth
    }

    if (selected == 1) {
        $("#chart-title").text("History and Price Prediction Bitcoin (BTC)")
        return data.btc
    }

    $("#chart-title").text("History and Price Prediction Ethrerum (ETH)")
    return data.eth
}

function formatDate(str) {

    // console.log(str.substring(0,10) + " " + str.substring(11, 19));
    // return str.substring(0,10) + " " + str.substring(11, 19);
    return str.substring(11, 19);

}


const getDays = (numberOfDays) => {
    let res = [];
    const currentDay = new Date();
    for (let index = 0; index < numberOfDays; index++) {
        let nextDay = currentDay.setDate(currentDay.getDate() + 1);
        res.push(new Date(nextDay).toJSON().slice(0, 10))
    }
    return res;
}

function convertUTCDateToLocalDate(date_to_convert_str) {
    let date = new Date(date_to_convert_str)
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate.toJSON().slice(0, 19);
}