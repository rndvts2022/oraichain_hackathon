'use strict';

module.exports = function (app) {
	const aiPredictionHandlers = require('../controllers/ai_prediction.js')
	const arbitrageHandlers = require('../controllers/arbitrage.js')
	const tokenHandlers = require('../controllers/tokenController.js')
	const tokenTradedPairHandlers = require('../controllers/tokenTradePairController')


	// Token
	app.route('/token/addNew')
		.post(tokenHandlers.addNew);
	app.route('/token/findAll')
		.get(tokenHandlers.findAll);
	app.route('/token/findByTokenName/:symbol')
		.get(tokenHandlers.findByTokenName);

	// // Token Price
	// app.route('/tokenPrice/addNew')
	// 	.post(tokenPriceHandlers.addNew);
	// app.route('/tokenPrice/findBySymbol/:symbol')
	// 	.get(tokenPriceHandlers.findBySymbol);

	// Token Trade Pair
	// app.route('/tokenTradedPair/addNew')
	// 	.post(tokenTradedPairHandlers.addNew);
	// app.route('/tokenTradedPair/findByOwner/:owner')
	// 	.get(tokenTradedPairHandlers.findByTokenTradePairOwner);

	app.route('/arbitrage/findByTime')
		.post(arbitrageHandlers.findByTime);
	app.route('/ai/pricePrediction')
		.post(aiPredictionHandlers.pricePrediction);

	app.route('/tokenTradedPair/time')
		.post(tokenTradedPairHandlers.findByTime);
	app.route('/tokenTradedPair/findByTimeAndLimit')
		.post(tokenTradedPairHandlers.findByTimeAndLimit);
	app.route('/tokenTradedPair/findByTimeAndLimit')
		.get(tokenTradedPairHandlers.findByTimeAndLimit);
};
