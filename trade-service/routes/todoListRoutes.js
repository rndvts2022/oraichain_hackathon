'use strict';

module.exports = function (app) {
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

	app.route('/tokenTradedPair/time')
		.post(tokenTradedPairHandlers.findByTime);
	app.route('/tokenTradedPair/findByTimeAndLimit')
		.post(tokenTradedPairHandlers.findByTimeAndLimit);
};
