const PrerenderSPAPlugin = require('@dreysolano/prerender-spa-plugin');
const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./base.config');
// The following files are generated via npm script from the corresponding TS version
const { Paths } = require('../src/models/webpack-paths');
const { ScoreKey } = require('../src/models/webpack-score-key');

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
