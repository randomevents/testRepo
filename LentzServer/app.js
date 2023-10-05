//npm and app are organizational objects. I use npm to keep track of modules from NPM and app to show that it's a native module (i.e. one that you wrote) or settings
let npm = {};
let app = {
    port: 1337,
    url: '',
    name: ''
};

//setting up express
npm.express = require('express');
npm.expressApp = npm.express();
//module handles some common security issues
npm.helmet = require('helmet');

//takes care of caching issues
npm.expressApp.disable("x-powered-by");
npm.expressApp.use(function (req, res, next) {
    res.header('etag', false);
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, private, max-age=0');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.header('Surrogate-Control', 'no-store');

    next();
});

//used for information and building a foundation for future modules like websockets
npm.os = require('os');
npm.server = require('http').createServer(npm.expressApp);
npm.Process = require('process');

//handle errors so server doesn't crash
npm.Process.on('unhandledRejection', (error, promise) => {
    console.log(' Unhandled Rejection: ', promise);
    console.log(' Error: ', error);
});

npm.Process.on('uncaughtException', (err) => console.log('node js process error\n', err));

//makes requires (loading modules) easier in the future by taking care of relative paths
npm.path = require('path');

global.pathServer = npm.path.resolve(`${__dirname}`) + '/';
global.requireServer = name => require(`${global.pathServer}${name}`);
global.requireServerApp = name => require(`${global.pathServer}server/app/${name}`);
global.requireServerRoutes = name => require(`${global.pathServer}server/routes/${name}`);

//utility modules for formating and logging
app.Server = requireServerApp('utility/server/server');
app.Date = requireServerApp('utility/dates/dates');
app.Logger = requireServerApp('utility/logger/logger');
app.Format = requireServerApp('utility/format/format');

//global is a global scoped object native to nodeJS
global.serverConnection = {
    listen: null,
    sockets: {},
    socketKey: 0
};

//starts server and gives info about the system on startup
global.serverConnection.listen = npm.server.listen(app.port, () => {
    app.Logger.message({
        action: 'Platform', detail: {
            text: app.Format.literalFormat`
        Server -: ${app.name}
        CPU -: ${npm.os.cpus()[0].model} ${npm.os.cpus().length} Cores
        Platform -: ${npm.os.platform()}
        Architecture -: ${npm.os.arch()}
        Memory (free / total)-: ${parseInt(npm.os.freemem() / 1e9)}GB / ${parseInt(npm.os.totalmem() / 1e9)}GB
        Architecture -: ${npm.os.arch()}
        Network Addresses -: ${JSON.stringify(npm.os.networkInterfaces())}
        Port -: ${app.port}
        External URL -: ${app.url}
        ` }
    });
});

//formatted server side console output
npm.morgan = require('morgan');
npm.expressApp.use(npm.morgan('dev'));
npm.expressApp.use(npm.morgan((tokens, req, res) => {
    let ipAddress = req.headers['x-forwarded-for'] || req.ip;
    let status = tokens.status(req, res);
    let statusColor = status >= 500 ? 'red' : status >= 400 ? 'yellow' : status >= 300 ? 'cyan' : status >= 200 ? 'green' : 'white';

    let string = [
        ipAddress,
        tokens.url(req, res),
        `<span style="color:${statusColor};">${status}</span>`,
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ];

    app.Logger.message({ action: req.method, detail: { text: `${string.join(' ')}` }, console: false });
}));

//handles browsing errors (404, 500, 502, etc., etc.) in console output
npm.expressApp.use((err, req, res, next) => {
    if (err) {
        app.Logger.message({ action: 'Error', detail: { text: `${err}` }, console: true });
    }

    next();
});

//setup the different paths and which file handles them, order them so that closest to the root "/" is at the bottom of the list
let routes = {};
routes['root'] = requireServerRoutes('http/root.js');

npm.expressApp.use(`/`, npm.helmet(app.Server.parsers.CSPParser), npm.express.json(app.Server.parsers.JSONParser), npm.express.urlencoded(app.Server.parsers.URLParser), routes['root']);

//your site's 404 screen
npm.expressApp.use(npm.helmet(app.Server.parsers.CSPParser), function (req, res) {
    res.status('404')
        .send(`<html><body>
            <div>
            404 Error
            </div>
            </body><html>`
        );
});