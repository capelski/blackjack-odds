const PrerenderSPAPlugin = require('@dreysolano/prerender-spa-plugin');
const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./base.config');
const { Paths } = require('../src/models/paths.js');

module.exports = merge(baseConfig, {
    mode: 'production',
    plugins: [
        new PrerenderSPAPlugin({
            routes: Object.values(Paths),
            staticDir: path.join(__dirname, '..', 'docs')
        })
    ]
});
