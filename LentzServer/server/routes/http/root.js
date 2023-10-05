'use strict';
let npm = {};
npm.express = require('express');
npm.router = npm.express.Router();

let app = {};

//basic echo test
npm.router.post('/echo', function (req, res) {
    res.setHeader('Content-Type', req.headers['content-type']);
    res.send(req.body);
});

//passes through external URLs
npm.router.post('/external', async function (req, res) {
    req.body.contentType = req.body.contentType || 'json';
    req.body.method = req.body.method || 'get';

    res.setHeader('Content-Type', `application/${req.body.contentType.toLowerCase() || 'json'}`);

    switch (req.body.method.toLowerCase()) {
        case 'get':
            res.send(await app.Http.get(req.body.parameters));
            break;
        case 'post':
            res.send(await app.Http.post(req.body.parameters));
            break;
    }
});

//root, pulls files from client/content_site
npm.router.use('/', npm.express.static('client/content_site'));


module.exports = npm.router;