let moduleJS = {};

moduleJS.parseIsNumber = function (data) {
    if (moduleJS.isNumeric(data)) return parseFloat(data);
    else return data;
};

moduleJS.isNumeric = function (n) {
    return !Number.isNaN(n / 1);
};

moduleJS.isString = function (n) {
    return typeof n === 'string';
};   

moduleJS.addCommas = function (nStr) {
    nStr += '';
    let x = nStr.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) { x1 = x1.replace(rgx, '$1' + ',' + '$2'); }

    return x1 + x2;
};

moduleJS.convertLettersToNumbers = function (text) {
    text = text.toUpperCase();
    var value = 0;
    for (var i = 0; i < text.length; i++)
        value = value * 26 + text.charCodeAt(i) - 64;
    return value;
};

module.convertNumbersToLetters = function (value) {
    return (value >= 26 ? module.convertNumbersToLetters(~~(value / 26) - 1) : '') +
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[~~(value % 26)];
};

moduleJS.stripNonAlphanumeric = function (x) {
    return x.replace(/[^0-9a-z]/gi, '');
};

moduleJS.stripNonAlphanumericExSpacesDash = function (x) {
    return x.replace(/[-]{2,}/gi, '').replace(/[^0-9a-zA-Z- ]/gi, '');
};

moduleJS.leadingZero = function (num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
};

moduleJS.sqlEncode = function (data) {
    if (typeof data === 'string') {
        data = data.replace(/'/g, "''");
        if (data.includes(';'))
            data = '';

        return data;
    }
    else
        return data;
};

moduleJS.htmlEncode = function (data) {
    if (typeof data === 'string')
        return data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\\/g, '&#x27;').replace(/\//g, '&#x2F;');
    else
        return data;
};

moduleJS.htmlDecode = function (data) {
    if (typeof data === 'string')
        return data.replace(/\&amp;/g, '&').replace(/\&lt;/g, '<').replace(/\&gt;/g, '>').replace(/\&quot;/g, '"').replace(/\&#39;/g, "'").replace(/\&#x27;/g, '\\').replace(/\&#x2F;/g, '/');
    else
        return data;
};

moduleJS.base64Encode = function (str) {
    return btoa(str);
};

moduleJS.base64Decode = function (str) {
    return atob(str);
};

moduleJS.literalFormat = function (strings, ...values) {
    let output = '';
    for (let i = 0; i < values.length; i++) {
        output += strings[i] + values[i];
    }
    output += strings[values.length];

    // Split on newlines.
    let lines = output.split(/(?:\r\n|\n|\r)/);

    // Rip out the leading whitespace.
    return lines.map((line) => {
        return line.replace(/^\s+/gm, '');
    }).join('\n').trim();
};

moduleJS.capitalizeFirstLetter = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

moduleJS.replaceAll = function (str, str1, str2, ignore) {
    return str.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), ignore ? "gi" : "g"), typeof str2 === "string" ? str2.replace(/\$/g, "$$$$") : str2);
};

moduleJS.toTitleCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

moduleJS.cleanString = function (str) {
    return str.replace(/(?!\w|\s)./g, '').replace(/\s+/g, ' ').replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2');
};

moduleJS.formatValue = function (obj) {
    if (obj.format === '' || obj.value === '' || (moduleJS.isNumeric(obj.value) && parseFloat(obj.value) === 0)) return '';

    if (moduleJS.isNumeric(obj.value)) {
        let negative = obj.value < 0 ? true : false;

        if (obj.format.format) {
            obj.value = (parseFloat(obj.value) * (obj.format.format.includes('percent') ? 100 : 1)).toFixed(obj.format.decimals);
            obj.value = obj.format.format.includes('percent') ? `${obj.value}%` : this.addCommas(obj.value);
            if (!obj.format.format.includes('percent') && negative) obj.value = `(${obj.value.replace('-','')})`;

            if (obj.format.format.includes('_color'))
                if (negative)
                    obj.value = `<span style="color:red">${obj.value}</span>`;
                else
                    obj.value = `<span style="color:green">${obj.value}</span>`;
        }

        return obj.value;
    }

    if (obj.format.format && obj.format.format.includes('date')) obj.value = obj.value.slice(0, 10);

    return obj.value;
};

moduleJS.convertCharStr2jEsc = function (str, parameters) {
    // Converts a string of characters to JavaScript escapes
    // str: sequence of Unicode characters
    // parameters: a semicolon separated string showing ids for checkboxes that are turned on
    var highsurrogate = 0;
    var suppCP;
    var pad;
    var n = 0;
    var pars = parameters.split(';');
    var outputString = '';
    for (var i = 0; i < str.length; i++) {
        var cc = str.charCodeAt(i);
        if (cc < 0 || cc > 0xFFFF) {
            outputString += '!Error in convertCharStr2UTF16: unexpected charCodeAt result, cc=' + cc + '!';
        }
        if (highsurrogate !== 0) { // this is a supp char, and cc contains the low surrogate
            if (0xDC00 <= cc && cc <= 0xDFFF) {
                suppCP = 0x10000 + ((highsurrogate - 0xD800) << 10) + (cc - 0xDC00);

                pad = suppCP.toString(16).toUpperCase();
                outputString += '\\u{' + pad + '}';

                highsurrogate = 0;
                continue;
            }
            else {
                outputString += 'Error in convertCharStr2UTF16: low surrogate expected, cc=' + cc + '!';
                highsurrogate = 0;
            }
        }
        if (0xD800 <= cc && cc <= 0xDBFF) { // start of supplementary character
            highsurrogate = cc;
        }
        else {
            if (cc > 0x1f && cc < 0x7F) {
                outputString += String.fromCharCode(cc);
            }
            else if (parameters.match(/es6styleSC/)) {
                pad = cc.toString(16).toUpperCase();
                outputString += '\\u{' + pad + '}';
            }
        }
    }
    return outputString;
};

module.exports = moduleJS;