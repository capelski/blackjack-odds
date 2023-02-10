const PrerenderSPAPlugin = require('@dreysolano/prerender-spa-plugin');
const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./base.config');
// The following file is generated via npm script
const { prerenderingRoutes } = require('./routes/logic/paths');

console.log(`Prerendering ${prerenderingRoutes.length} routes...`);

module.exports = merge(baseConfig, {
    mode: 'production',
    plugins: [
        new PrerenderSPAPlugin({
            routes: prerenderingRoutes,
            postProcess: (renderedRoute) => {
                console.log(`√ ${renderedRoute.route}`);
                return renderedRoute;
            },
            staticDir: path.join(__dirname, '..', 'docs')
        })
    ]
});
