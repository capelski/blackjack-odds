const { merge } = require('webpack-merge');
const baseConfig = require('./base.config');

module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        historyApiFallback: {
            index: '/blackjack-odds'
        },
        publicPath: '/blackjack-odds',
        open: true,
        openPage: 'blackjack-odds'
    }
});
