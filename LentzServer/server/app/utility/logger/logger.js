let app = {};
app.Dates = requireServerApp('utility/dates/dates');

let moduleJS = {};

moduleJS.message = async function (obj) {
    try {
        obj.timestamp = app.Dates.get('datetime', 'utc');
        obj.status = obj.status || 'OK';

        let log = `${obj.timestamp}${obj.status !== 'OK' ? ` (${obj.status})` : ``} : ${obj.action}${obj.detail ? ` - ${obj.detail.error || obj.detail.text || obj.detail.event}` : ``}`;
        console.log(log);
    }
    catch (err) {
        console.log('Error writing to log');
    }
};

moduleJS.parse = function (err) {
    let msg = err;
    if (err.stack)
        msg = err.stack;

    return msg;
};

moduleJS.error = function (err) {
    let msg = err;
    if (err.stack)
        msg = err.stack;

    try {
        moduleJS.message({ action: 'Error', detail: { text: msg }, console: true });
    }
    catch (e) {
    }
    return msg;
};

module.exports = moduleJS;