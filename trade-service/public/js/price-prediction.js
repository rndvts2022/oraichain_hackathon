
$("#button-get-info").click(function () {

    let url_arbitrages = "http://66.42.61.9:8002/coin-predict/eth";
    // let url_arbitrages = "http://localhost:3000/arbitrage/findByTime"

    $("#loader").show()

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
            let prices = result
            console.log(prices)
            createChart1("myChart1", prices);
            $("#loader").hide()
            $("#prediction-chart").show()
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
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last_timeline,
            datasets: [
                {
                    label: 'Green - History Price',
                    data: last_prices,
                    borderColor: '#FFE0B2',
                    fill: true,
                    backgroundColor: '#FFE0B2'
                },
                {
                    label: 'Blue - Prediction Price',
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