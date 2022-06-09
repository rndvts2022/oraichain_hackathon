// khai báo library
const express = require('express'),
    app = express(),
    port = process.env.APP_PORT || 3000,
    path = require('path'),
    session = require('express-session'),
    cors = require('cors'),
    flash = require('connect-flash'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    mongoose_url = process.env.MONGO_URL || 'mongodb://localhost:27017/oraichain',
    TokenModel = require('./models/token'),
    TokenTradePairModel = require('./models/token_trade_pair'),
    routes = require('./routes/todoListRoutes'),
    render = require('./routes/renderPage');

mongoose.Promise = global.Promise;
mongoose.connect(mongoose_url);


//init app
app.use(session({ secret: 'thuanbq', saveUninitialized: true, resave: true }));
app.use(cors());
app.options('*', cors());

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(flash());

// View engine setup
app.set('views', path.join(__dirname, 'views')); //chua giao dien 
app.set('view engine', 'ejs');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    next();
});

//set public folder
app.use(express.static(path.join(__dirname, 'public'))); // assets (images, css, scss...)
app.use(session({ secret: 'thuanbq', saveUninitialized: true, resave: true }));
routes(app);
render(app);


// app.post('/marketPrice', async (req, res, next) => {
//     console.log(req.body)
//     io.sockets.emit("market-price", req.body)
//     return res.json({ 'status': true })
// });

TokenTradePair = mongoose.model('TokenTradePair');

console.log(Date.now())

app.post('/arbitrage', async (req, res, next) => {
    // console.log(req.body)
    if(req.body.typeTrade == undefined || req.body.typeTrade == null) return res.json({ 'status': false })

    let typeTrade;
    if(req.body.typeTrade === 'doBuyKucoinSellUniswap'){
        typeTrade = true;
    }else{
        typeTrade = false
    }
    
    let trade = {
        "owner": "thuanbq1" + Date.now(),
        "typeTrade": typeTrade,
        "info":req.body
    }

    console.log("tokenTradePair:", trade)
    let tokenTradePair = new TokenTradePair(trade);
    // tokenTradePair.save(function (err, tokenTradePair) {
    //     if (err) {
    //         console.log("error")
    //     } else {
    //         console.log("doneeeee")
    //     }
    //   });
    await tokenTradePair.save();

    io.sockets.emit("token-pair-arbitrage", req.body)
    return res.json({ 'status': true })
});

// app.post('/tradeAction', async (req, res, next) => {
//     console.log(req.body)
//     if(req.body.action == undefined || req.body.action == null) return res.json({ 'status': false })
    
//     let trade = {
//         "sellOrBuy": req.body.action === 'SELL'?0:1,
//         "info":req.body
//     }
//     let tradeHistory = new TradeHistory(trade);
//     await tradeHistory.save();

//     io.sockets.emit("trade-action", req.body)
//     return res.json({ 'status': true })
// });

// app.post('/frontRunningAction', async (req, res, next) => {
//     console.log(req.body)
//     io.sockets.emit("frontRun-action", req.body)
//     return res.json({ 'status': true })
// });

const server = require("http").Server(app);
console.log("server is running on port: " + port)
server.listen(port);

/* config socket*/
const io = require("socket.io")(server);
io.on('connection', socket => {

    // emit an event to the socket
    socket.emit('request');

    // emit an event to all connected sockets
    io.emit('broadcast',
    /* … */);

    // listen to the event
    socket.on('reply', (data) => { /* … */
        console.log("message: ", data)
    });

    // listen to the event
    socket.on('connection-status', (data) => { /* … */
        console.log("message: ", data)
    });

});

// io.on('connect', onConnect);

// function onConnect(socket){

//   // Gửi cho tất cả client
//   socket.emit('hello', 'can you hear me?', 1, 2, 'abc');

//   // Gửi cho tất cả client ngoại trừ người gửi
//   socket.broadcast.emit('broadcast', 'hello friends!');

//   // Gửi cho tất cả client trong room 'game' ngoại trừ người gửi
//   socket.to('game').emit('nice game', "let's play a game");

//   // Gửi cho tất cả client trong room 'game1' và room 'game2' ngoại trừ người gửi
//   socket.to('game1').to('game2').emit('nice game', "let's play a game (too)");

//   //  Gửi cho tất cả client trong room 'game' bao gồm cả người gửi
//   io.in('game').emit('big-announcement', 'the game will start soon');

//   // Gửi cho tất cả client trong namespace 'myNamespace', bao gồm cả người gửi
//   io.of('myNamespace').emit('bigger-announcement', 'the tournament will start soon');

//   // Gửi cho room 'room' trong namespace 'myNamespace', bao gồm cả người gửi
//   io.of('myNamespace').to('room').emit('event', 'message');

//   // Gửi tin nhắn riêng cho socket đó qua socketId
//   io.to(`${socketId}`).emit('hey', 'I just met you');

//   // Gửi không đính kèm file nén
//   socket.compress(false).emit('uncompressed', "that's rough");

//   // Việc gửi tin nhắn này cần sự chấp nhận từ client thì mới có thể đến được client
//   socket.volatile.emit('maybe', 'do you really need it?');

//   // Gửi dữ liệu liên quan đến hệ nhị phân
//   socket.binary(false).emit('what', 'I have no binaries!');

//   // Gửi dữ liệu cho tất cả client sử dụng node
//   io.local.emit('hi', 'my lovely babies');

//   // Gửi đến tất cả client kết nối đến
//   io.emit('an event sent to all connected clients');

// };