'use strict';
require('dotenv').config()
const mongoose = require('mongoose'),
  TokenTradePair = mongoose.model('TokenTradePair');

exports.findByTime = function (req, res) {

  try {
    TokenTradePair.find({ //query today up to tonight
      created: {
        $gte: req.body.startTime,
        $lt: req.body.endTime
      }
    }, function (err, trades) {

      if (err) {
        return res.status(500).send({ ok: false, error: { message: err, code: 500 } });
      }

      if (!trades) return res.status(400).send({ ok: false, message: `Data empty` });

      return res.status(200).send({ ok: true, result: trades });
    });
  } catch (err) {
    return res.status(500).send({ ok: false, error: { message: err, code: 500 } });
  }

};

exports.findByTimeAndLimit = function (req, res) {
  console.log(req.body.time)
  console.log(req.body.limit)
  console.log(req.body.typeTrade)

  if (req.body.time === null || req.body.time === undefined) {
    return res.status(400).send({ ok: false, error: { message: 'Please attack field time', code: 400 } });
  }

  if (req.body.limit === null || req.body.limit === undefined) {
    return res.status(400).send({ ok: false, error: { message: 'Please attack field limit', code: 400 } });
  }

  let time = req.body.time;
  let limit = req.body.limit

  let condition;
  if (req.body.typeTrade == undefined || req.body.typeTrade == null) {
    console.log("typeTrade: null" )
    condition = {
      created: {
        $lt: time
      }
    }
  } else {
    console.log("typeTrade: oke",req.body.typeTrade )
    condition = {
      created: {
        $lt: time
      },
      typeTrade: req.body.typeTrade
    }
  }

  try {
    TokenTradePair.find(condition, function (err, trades) {
      if (err) {
        return res.status(500).send({ ok: false, error: { message: err, code: 500 } });
      }

      if (!trades) return res.status(400).send({ ok: false, message: `Data empty` });

      return res.status(200).send({ ok: true, result: trades });
    }).sort({ _id: -1 }).limit(limit);

  } catch (err) {
    return res.status(500).send({ ok: false, error: { message: err, code: 500 } });

  }

};
