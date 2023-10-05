let npm = {};
npm.moment = require('moment');
npm.moment = require('moment-timezone');

let app = {};
app.Objects = requireServerApp('utility/objects/objects');

let moduleJS = {};

moduleJS.get = function (type, timeZone, dateObj) {
    if (!app.Objects.isPlainObject(dateObj))
        dateObj = { dateTime: dateObj };

    let dateUTC = null;

    if (timeZone !== 'utc') {
        if (dateObj.timeZone)
            dateUTC = npm.moment.tz(dateObj.dateTime || npm.moment().utc(), dateObj.timeZone);
        else
            dateUTC = npm.moment(dateObj.dateTime || npm.moment());
    }
    else {
        if (dateObj.timeZone)
            dateUTC = npm.moment.tz(dateObj.dateTime || npm.moment(), dateObj.timeZone).utc();
        else
            dateUTC = npm.moment(dateObj.dateTime || npm.moment()).utc();
    }

    let day = npm.moment(dateUTC).day();

    switch (type) {
        case 'day':
            return day;
        case 'date':
            return npm.moment(dateUTC).format('YYYY-MM-DD');
        case 'datetime':
            return npm.moment(dateUTC).format('YYYY-MM-DDTHH:mm:ss');
        case 'datetime_pretty':
        case 'datetime_title':
            return npm.moment(dateUTC).format('YYYY-MM-DD HH:mm');
        case 'datetime_milliseconds':
            return npm.moment(dateUTC).format('YYYY-MM-DDTHH:mm:ss.SSS');
        case 'datetime_safe':
            return npm.moment(dateUTC).format('YYYY-MM-DD HHmmss');
        case 'date_file':
            return npm.moment(dateUTC).format('YYYYMMDD');
        case 'weekday_valid': {
            let adjust_weekday = 0;

            if (day === 0) adjust_weekday = 2;
            else if (day === 6) adjust_weekday = 1;

            return npm.moment(dateUTC).subtract(adjust_weekday, 'days').format('YYYY-MM-DD');
        }
        case 'time':
            return npm.moment(dateUTC).format('HH:mm:ss');
        case 'time_milliseconds':
            return npm.moment(dateUTC).format('HH:mm:ss.SSS');
        default:
            break;
    }
};

moduleJS.timeZones = function () {
    return npm.moment.tz.names();
};

moduleJS.new = function (type) {
    if (type === 'time')
        return new Date().getTime();
    else
        return new Date();
};

moduleJS.day = function (date) {
    return npm.moment(date).day();
};

moduleJS.weekday = function (date) {
    let day = moduleJS.day(date);
    return !(day === 0 || day === 6);
};

moduleJS.adjust = function (date, type, adjust) {
    switch (type) {
        case 'minute':
        case 'hour':
            return npm.moment(date).add(adjust, type).format('YYYY-MM-DDTHH:mm:ss');
        default:
            return npm.moment(date).add(adjust, type).format('YYYY-MM-DD');
    }
};

moduleJS.isAfter = function (dateCompare, dateTest) {
    return npm.moment(dateCompare).isAfter(dateTest);
};

moduleJS.isBefore = function (dateCompare, dateTest) {
    return npm.moment(dateCompare).isBefore(dateTest);
};

moduleJS.isAfterEqual = function (dateCompare, dateTest) {
    return npm.moment(dateCompare).isSameOrAfter(dateTest);
};

moduleJS.isBeforeEqual = function (dateCompare, dateTest) {
    return npm.moment(dateCompare).isSameOrBefore(dateTest);
};

moduleJS.isSame = function (dateCompare, dateTest) {
    return npm.moment(dateCompare).isSame(dateTest);
};

moduleJS.isBetween = function (dateCompare, dateStart, dateEnd, inclusivity) {
    return npm.moment(dateCompare).isBetween(dateStart, dateEnd, null, inclusivity || '[]');
};

module.exports = moduleJS;