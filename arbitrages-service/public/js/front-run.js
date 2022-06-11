const socket = io();
const table_size = 15
let frontRun_queue = new Queue();
let frontRun_Transactions = new Array();


$(function () {
    /* init */
    showViewSaleRevenue(undefined)
    socket.on('frontRun-action', function (data) {
        console.log(data)
        showViewCurrentSell(data)
    });
});

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

    frontRun_queue.enqueue(data);
    if (frontRun_queue.size() === table_size) {
        frontRun_queue.dequeue()
    }

    let items = frontRun_queue.items.reverse();
    $("#current-frontRun").empty()
    items.forEach((item, index) => {
        let obj = extractTraction(item)
        let rowView = viewSellFormat(obj, index + 1)
        $("#current-frontRun").append(rowView);
        sleep(100)
    });
    frontRun_queue.items.reverse();
}

function viewSellFormat(data, index) {
    if (data == null) return
    let flash = ''
    if (index === 1) {
        flash = `class="thuan-flash"`
    }
    let item =
        `
        <tr >
            <td >${index}</td>
            <td ${flash}>${currentDateTime()}</td>
            <td>${data.method}</td>
            <td>${data.txHash}</td>
            <td>${data.in_amount}</td>
            <td>${data.out_amount}</td>
            <td>${data.in_token_addr}</td>
            <td>${data.out_token_addr}</td>
        </tr>
        `
    return item;
}

function extractTraction(frontrun) {

    let transaction = frontrun.transaction
    let parseInput = frontrun.parseInput

    let gasPrice = parseInt(transaction['gasPrice']) / 10 ** 9
    let data = parseInput
    let method = data[0];
    let params = data[1];
    gasPrice = parseInt(transaction['gasPrice']) / 10 ** 9;

    let obj;
    if (method=== 'swapExactETHForTokens') {
        let in_amount = transaction.value;
        let out_min = params[0].value;

        let path = params[1].value;
        let in_token_addr = path[0];
        let out_token_addr = path[path.length - 1];

        let recept_addr = params[2].value;
        let deadline = params[3].value;

        obj = {
            'txHash': transaction.hash,
            'gasPrice': gasPrice,
            'method': method,
            'in_amount': in_amount,
            'out_amount': out_min,
            'in_token_addr': in_token_addr,
            'out_token_addr': out_token_addr,
        }
    } else if (method === 'swapExactTokensForETHSupportingFeeOnTransferTokens') {
        let in_amount = params[0].value;
        let out_min = params[1].value;

        let path = params[2].value;
        let in_token_addr = path[0];
        let out_token_addr = path[path.length - 1];

        let recept_addr = params[2].value;
        let deadline = params[4].value;

        obj = {
            'txHash': transaction.hash,
            'gasPrice': gasPrice,
            'method': method,
            'in_amount': in_amount,
            'out_amount': out_min,
            'in_token_addr': in_token_addr,
            'out_token_addr': out_token_addr,
        }

    }
    else if (method === 'swapETHForExactTokens') {

        let in_max = transaction.value;
        let out_amount = params[0].value;

        let path = params[1].value;
        let in_token_addr = path[0];
        let out_token_addr = path[path.length - 1];

        let recept_addr = params[2].value;
        let deadline = params[3].value;

        obj = {

            'txHash': transaction.hash,
            'gasPrice': gasPrice,
            'method': method,
            'in_amount': in_max,
            'out_amount': out_amount,
            'in_token_addr': in_token_addr,
            'out_token_addr': out_token_addr,
        }

    }
    else if (method === 'swapExactTokensForTokens') {
        let in_amount = params[0].value;
        let out_min = params[1].value;

        let path = params[2].value;
        let in_token_addr = path[path.length - 2];
        let out_token_addr = path[path.length - 1];

        let recept_addr = params[3].value;
        let dead_line = params[4].value;

        obj = {
            'txHash': transaction.hash,
            'gasPrice': gasPrice,
            'method': method,
            'in_amount': in_amount,
            'out_amount': out_min,
            'in_token_addr': in_token_addr,
            'out_token_addr': out_token_addr,
        }

    }
    else if (method == 'swapTokensForExactTokens') {
        let out_amount = params[0].value;
        let in_max = params[1].value;

        let path = params[2].value;
        let in_token_addr = path[path.length - 2];
        let out_token_addr = path[path.length - 1];

        let recept_addr = params[3].value;
        let dead_line = params[4].value;

        obj = {
            'txHash': transaction.hash,
            'gasPrice': gasPrice,
            'method': method,
            'in_amount': in_max,
            'out_amount': out_amount,
            'in_token_addr': in_token_addr,
            'out_token_addr': out_token_addr,
        }
    } else {
        console.log(method)
        return null
    }

    return obj
}


function currentDateTime() {
    var d = new Date();
    d.toLocaleString()
    return d.toLocaleString()
}