const { merge } = require('webpack-merge');
const baseConfig = require('./base.config');

module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        historyApiFallback: true,
        publicPath: '/blackjack-odds',
        open: true,
        openPage: 'blackjack-odds'
    }
});
