'use strict';
require('dotenv').config()
const mongoose = require('mongoose'),
  Token = mongoose.model('Token');

exports.addNew = function (req, res) {
  try {
    let newToken = new Token(req.body);
    newToken.save(function (err, token) {
      if (err) {
        return res.status(400).send({ ok: false, error: { message: err, code: 400 } });
      } else {
        return res.status(200).send({ ok: true, result: token });
      }
    });
  } catch (err) {
    return res.status(500).send({ ok: false, error: { message: err, code: 500 } });
  }
};

exports.findAll = function (req, res) {

  try {
    Token.find({
    }, function (err, tokens) {

      if (err) {
        return res.status(500).send({ ok: false, error: { message: err, code: 500 } });
      }

      if (!tokens) return res.status(400).send({ ok: false, message: `Data empty` });

      return res.status(200).send({ ok: true, result: tokens });
    });
  } catch (err) {
    return res.status(500).send({ ok: false, error: { message: err, code: 500 } });
  }

};

exports.findByTokenName = function (req, res) {

  const symbol = req.params.symbol;
  if (symbol === null || symbol === undefined) {
    return res.status(400).send({ ok: false, error: { message: 'Please attack field tokenName or symbol', code: 400 } });
  }

  try {
    Token.findOne({
      symbol: symbol
    }, function (err, token) {

      if (err) {
        return res.status(500).send({ ok: false, error: { message: err, code: 500 } });
      }

      if (!token) return res.status(400).send({ ok: false, message: `Token ${symbol} is not exist` });

      return res.status(200).send({ ok: true, result: token });
    });
  } catch (err) {
    return res.status(500).send({ ok: false, error: { message: err, code: 500 } });
  }

};
