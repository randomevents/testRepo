'use strict';
let npm = {};
let app = {};

let moduleJS = {};

moduleJS.cacheable = true;

moduleJS.setCacheable = function (state) {
    moduleJS.cacheable = state;
};

moduleJS.isCacheable = function (req, res, next) {
    if (moduleJS.cacheable) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.removeHeader('Pragma');
    }
    next();
};

moduleJS.isNotCacheable = function (req, res, next) {
    next();
};

moduleJS.parsers = {};
moduleJS.parsers.JSONParser = {
    limit: '50mb',
    type: 'application/json'
};

moduleJS.parsers.URLParser = {
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
};

moduleJS.parsers.CSPParser = {
    referrerPolicy: { policy: 'same-origin' },
    contentSecurityPolicy: {
        directives: {
            //...npm.helmet.contentSecurityPolicy.getDefaultDirectives(),
            "default-src": ["'self'", "'unsafe-eval'", 'data:', 'blob:', 'ws:', 'wss:', 'filesystem:'],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'data:', 'blob:', 'ws:', 'wss:', 'filesystem:'],
            "img-src": ['*', 'data:', 'blob:'],
            "style-src": ['*', "'unsafe-inline'", 'blob:'],
            "frame-src": ['*'],
            "connect-src": ['*']
        }
    }
};

module.exports = moduleJS;