const PrerenderSPAPlugin = require('@dreysolano/prerender-spa-plugin');
const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./base.config');
const { Paths } = require('../src/models/paths.js');
const { ScoreKey } = require('../src/models/score-key.js');

const routes = [
    Paths.casinoRules,
    Paths.dealerCards,
    Paths.legend,
    Paths.playerDecisions,
    ...Object.values(ScoreKey).map((scoreKey) => {
        return Paths.scorePlayerDecisions.replace(':scoreKey', scoreKey);
    })
];

module.exports = merge(baseConfig, {
    mode: 'production',
    plugins: [
        new PrerenderSPAPlugin({
            routes,
            staticDir: path.join(__dirname, '..', 'docs')
        })
    ]
});
