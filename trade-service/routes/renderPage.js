'use strict';

module.exports = function (app) {

    app.get('/:pageName', async (req, res, next) => {
        const pageName = req.params.pageName;
        switch (pageName) {
            case 'index':
                return res.render('index');
            case 'token-pair-trade':
                return res.render('token-pair-trade');
            case 'history':
                return res.render('history');
            case 'front-run':
                return res.render('front-run');
            case 'chart':
                return res.render('chart');
            default:
                return res.render('index');
        }
    });
};
