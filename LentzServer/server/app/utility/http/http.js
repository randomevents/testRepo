let npm = {};
npm.Fetch = require("node-fetch");

let app = {};
app.Objects = requireServerApp('utility/objects/objects');
app.Format = requireServerApp('utility/format/format');

let moduleJS = {};
moduleJS.authAltLoaded = false;

async function http_response(requestObj, request) {
    try {

        requestObj.timeout = requestObj.timeout || 60000;

        let signal = null;
        if (requestObj.timeout) {
            signal = {};
            signal.controller = new AbortController();
            signal.timer = setTimeout(() => {
                signal.controller.abort();
            }, requestObj.timeout);

            request.signal = signal.controller.signal;
        }

        let response = await moduleJS.http(requestObj.url, request, requestObj, signal);

        return response;
    }
    catch (error) {
        throw error;
    }
}

moduleJS.post = async function (requestObj) {
    try {
        let request = {};
        if (!requestObj.body) requestObj.body = {};

        if (requestObj.type !== 'file')
            request.body = JSON.stringify(requestObj.body);
        else
            request.body = requestObj.body;

        request.headers = app.Objects.merge({ "Content-Type": "application/json" }, requestObj.headers);
        if (!request.headers["Content-Type"])
            delete request.headers["Content-Type"];

        request.method = 'POST';
        request.raw = requestObj.raw || false;

        let response = await http_response(requestObj, request);

        return response;
    }
    catch (e) {
        throw e;
    }
};

moduleJS.get = async function (requestObj) {
    try {
        let request = {};
        request.headers = app.Objects.merge({}, requestObj.headers);
        request.method = 'GET';
        request.raw = requestObj.raw || false;

        let response = await http_response(requestObj, request);

        return response;
    }
    catch (e) {
        throw e;
    }
};

moduleJS.generateBasicAuth = function (username, password) {
    let tok = user + ':' + pass;
    let hash = app.Format.base64Encode(tok);
    return "Basic " + hash;
};

moduleJS.http = async function (url, request, requestObj, signal) {
    try {
        let reponse = null;

        response = await npm.Fetch(url, request);

        if (signal)
            clearTimeout(signal.timer);

        const contentType = response.headers.get('Content-Type') || '';

        if (response.ok) {          
            if (request.raw)
                return response;

            if (contentType.includes('application/json')) {
                let result = await response.json();
                if (app.Objects.defined(result.success) && !result.success) throw new Error(`${url}: Code:${response.status} Error:${await result.message}`);
                return result;
            }
            if (request.blob || contentType.includes('image')) {
                return await response.blob();
            }

            return await response.text();
        }

        if (response.status === 404)
            throw new Error(`${url}: Code:${response.status} Error:Page not found`);

        if (contentType.includes('application/json')) {
            let result = await response.json();
            throw new Error(`${url}: Code:${response.status} Error:${result.message}`);
        }

        throw new Error(`${url}: Code:${response.status} Error:${response.statusText}`);
    }
    catch (error) {
        clearTimeout(signal.timer);
        throw error.name === 'AbortError' ? new Error('Request Timed Out') : error;
    }
};

module.exports = moduleJS;