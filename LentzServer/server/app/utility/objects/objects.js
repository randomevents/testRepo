let app = {};
let moduleJS = {};

moduleJS.isPlainObject = function isPlainObject(o) {
    if (o === null || o === undefined) return false;

    return o instanceof Object && o.constructor === Object;
};

moduleJS.isEmptyObject = function (obj) {
    return Object.keys(obj).length === 0;
};

moduleJS.getArrayValue = function (obj, options) {
    options = options || { index: 0, excludeEmpty: true };

    if (obj && Array.isArray(obj) && obj.length >= options.index && options.excludeEmpty && obj[options.index] !== '')
        return obj[options.index];
    if (obj && Array.isArray(obj) && obj.length >= options.index && !options.excludeEmpty)
        return obj[options.index];
    else if (obj && !Array.isArray(obj))
        return obj;
    else
        return null;
};

moduleJS.merge = function (obj_base, obj_add, deep) {
    let obj_return = {};
    obj_add = obj_add || {};

    for (let key in obj_base) {
        if (moduleJS.isPlainObject(obj_base[key]) && !moduleJS.isEmptyObject(obj_base[key])) {
            obj_return[key] = {};
            for (let sub_key in obj_base[key])
                obj_return[key][sub_key] = obj_base[key][sub_key];
        }
        else {
            obj_return[key] = obj_base[key];
        }
    }

    for (let key in obj_add) {
        if (moduleJS.isPlainObject(obj_add[key]) && !moduleJS.isEmptyObject(obj_add[key])) {
            if (!moduleJS.defined(obj_return[key])) obj_return[key] = {};

            if (deep) obj_return[key] = moduleJS.merge(obj_return[key], obj_add[key]);
            else
                for (let sub_key in obj_add[key])
                    obj_return[key][sub_key] = obj_add[key][sub_key];
        }
        else {
            obj_return[key] = obj_add[key];
        }
    }

    return obj_return;
};

moduleJS.flatten = function (obj) {
    let output = {};
    for (let key in obj)
        if (moduleJS.isPlainObject(obj[key]))
            for (let subKey in obj[key])
                output[subkey] = obj[key][subKey];
        else output[key] = obj[key];

    return output;
};

moduleJS.missingKeys = function (obj_base, obj_add) {
    obj_add = obj_add || {};

    for (let key in obj_add)
        if (!moduleJS.defined(obj_base[key]))
            obj_base[key] = obj_add[key];
};

moduleJS.defined = function (exists) {
    if (typeof exists !== 'undefined' && exists !== null) return true;
    return false;
};

moduleJS.filter = function (source) {
    return Object.keys(this).every(key => source[key] === this[key]);
};

moduleJS.filterLowerCase = function (source) {
    return Object.keys(this).every(key => (source[key]).toLowerCase() === (this[key]).toLowerCase());
};

moduleJS.filter_multi = function (source) {
    return Object.keys(this).every(key => this[key].includes(source[key]));
};

moduleJS.exists = function (source) {
    let test = Object.keys(this).every(key => source[key] === this[key]);
    return test.length ? true : false;
};

moduleJS.filter_objValues = function (source) {
    if (this.filter) Object.keys(this.filter).every(key => source[key] === this.filter[key]) && this.value.includes(source[this.key]);
    else return this.value.includes(source[this.key]);
};

moduleJS.cloneInstance = function (obj) {
    return Object.assign(Object.create(obj), obj);
};

moduleJS.sort = function (fields) {
    var dir = [], i, l = fields.length;
    fields = fields.map(function (o, i) {
        if (o.direction === "desc") {
            dir[i] = -1;
        } else {
            dir[i] = 1;
        }
        return o.key;
    });

    return function (a, b) {
        for (i = 0; i < l; i++) {
            let aKey = fields[i];
            let bKey = aKey;

            if (Array.isArray(aKey)) {
                for (let x of aKey)
                    if (module.defined(a[x])) {
                        aKey = x;
                        break;
                    }

                for (let x of bKey)
                    if (module.defined(b[x])) {
                        bKey = x;
                        break;
                    }
            }

            if (!module.defined(a[aKey])) return -dir[i];
            if (!module.defined(b[bKey])) return dir[i];
            if (a[aKey] > b[bKey]) return dir[i];
            if (a[aKey] < b[bKey]) return -dir[i];
        }
    };

};

moduleJS.omit = function (obj, blacklist) {
    if (obj)
        return Object.entries(obj).filter(([key]) => !blacklist.includes(key)).reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {});
    else
        return {};
};

moduleJS.pick = function (obj, whitelist) {
    if (obj)
        return Object.entries(obj).filter(([key]) => whitelist.includes(key)).reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {});
    else
        return {};
};

moduleJS.intersection = function (arr1, arr2) {
    return arr1.filter(element => arr2.includes(element));
};

moduleJS.match = function (obj) {
    if (obj.keyMatch.length <= 5) return moduleJS.match_limit(obj);
    obj.base.map(x => Object.assign(x, moduleJS.omit(obj.merge.find(y => obj.keyMatch.every(key => y[key] === x[key])), Object.keys(x))));

    if (obj.reverse) obj.base = obj.base.filter(moduleJS.filter_multi, { identifier: moduleJS.uniqueValues(obj.merge, ['identifier'], { values: true }) });
    if (obj.allKeysDefined) return moduleJS.allKeys(obj.base);
};

moduleJS.match_test = function (obj, base, match) {
    for (let x of obj.keyMatch) {
        let keyBase = x;
        let keyMatch = x;
        let multi = false;
     
        if (x.includes('|')) {
            let keys = x.split('|');
            keyBase = keys[0];
            keyMatch = keys[1];

            if (obj.multiMatch && (multiMatch.includes(keyBase) || multiMatch.includes(keyMatch)))
                multi = true;
        } else {
            if (obj.multiMatch && multiMatch.includes(x))
                multi = true;
        }

        if ((!multi && base[keyBase] !== match[keyMatch]) || (multi && !moduleJS.intersection(base[keyBase].split('|'), match[keyMatch].split('|')).length))
            return false;
    }

    return true;
};

moduleJS.match_limit = function (obj) {
    for (let x of obj.base) {
        for (let y of obj.merge) {
            if (moduleJS.match_test(obj, x, y)) {
                for (let z in y)
                    if (!moduleJS.defined(x[z]) || (obj.overwrite && obj.overwrite.includes(z) && y[z]))
                        x[z] = y[z];

                if (obj.keyBuild) {
                    for (let z of obj.keyBuild)
                        x[`${z.group}:${z.key}`] = y[z.key];
                }

                break;
            }
        }
    }

    if (obj.reverse) obj.base = obj.base.filter(moduleJS.filter_multi, { identifier: moduleJS.uniqueValues(obj.merge, ['identifier'], { values: true }) });
    if (obj.allKeysDefined) obj.base = moduleJS.allKeys(obj.base);
    return obj.base;
};

moduleJS.allKeys = function (target) {
    let keys = moduleJS.uniqueKeys(target);
    return target.filter(y => keys.every(key => moduleJS.defined(y[key])));
};

moduleJS.merge_objArray = function (obj) {
    obj.base = moduleJS.match(obj);
    obj.base.push(...obj.merge.filter(y => obj.keyMatch.every(key => y[key]) && !obj.keyMatch.some(key => moduleJS.uniqueValues(obj.base, [key], { values: true }).includes(y[key]))));
};

moduleJS.uniqueKeys = function (target, optionsObj) {
    optionsObj = optionsObj || {};
    optionsObj.exclude = optionsObj.exclude || [];

    let output = [];
    for (let x of target)
        for (let y in x) {
            if (!output.includes(y) && !optionsObj.exclude.includes(y)) output.push(y);

            if (optionsObj.parseObjects && moduleJS.isPlainObject(x[y]))
                for (let z in x[y])
                    if (!output.includes(`${y}|${z}`) && !exclude.includes(`${y}|${z}`)) output.push(`${y}|${z}`);
        }

    return output;
};

moduleJS.orphanKeys = function (arrMaster, arrCompare) {
    let output = [];
    for (let x of arrCompare)
        if (!arrMaster.includes(x)) output.push(x);

    return output;
};

moduleJS.objArrayToArray = function (obj, excludeKeys) {
    let output = [];
    output[0] = moduleJS.uniqueKeys(obj, { exclude: excludeKeys });

    for (let y of obj) {
        let pos = output.length;

        output[pos] = [];
        for (let x of output[0])
            output[pos].push(moduleJS.defined(y[x]) ? y[x] : '');
    }

    return output;
};

moduleJS.findIndex = function (target, key, value) {
    return target.findIndex(obj => obj[key] === value);
};

moduleJS.findDelete = function (target, key, value) {
    return target.filter((obj) => !value.includes(obj[key]));
};

moduleJS.find = function (target, key, value) {
    return target.find(obj => obj[key] === value);
};

moduleJS.getAfter = function (target, key, value) {
    let output = [];
    let index = moduleJS.findIndex(target, key, value);
    if (index > -1 && target.length > index + 1)
        output = target.slice(index + 1);
    return output;
};

moduleJS.clone = function (obj) {
    let newObj = [];

    if (typeof obj !== 'object') {
        return obj;
    }
    if (!obj) {
        return obj;
    }

    if ('[object Array]' === Object.prototype.toString.apply(obj)) {
        newObj = [];
        for (let i = 0; i < obj.length; i++) {
            newObj[i] = moduleJS.clone(obj[i]);
        }
        return newObj;
    }

    newObj = {};
    for (let i in obj) {
        if (moduleJS.defined(obj[i])) {
            newObj[i] = moduleJS.clone(obj[i]);
        }
    }
    return newObj;
};

moduleJS.indexMove = function (arr, indexOld, indexNew) {
    if (indexNew !== indexOld) {
        arr.splice(indexNew, 0, arr[indexOld]);
        let adjust = indexOld > indexNew ? 1 : 0;
        moduleJS.indexDelete(arr, indexOld + adjust);
    }
};

moduleJS.indexDelete = function (arr, index) {
    if (index !== -1)
        arr.splice(index, 1);
};

moduleJS.valueDelete = function (arr, value) {
    let index = arr.indexOf(value);

    if (index !== -1)
        arr.splice(index, 1);
};

moduleJS.isJson = function (isTest) {
    try {
        JSON.parse(isTest);
    } catch (e) {
        return false;
    }
    return true;
};

moduleJS.uniqueValues = function (target, keys, options) {
    options = options || {};
    if (options.values) return [...new Set(target.map(item => item[[keys][0]]))];

    let holdArray = target.map(rowObj => {
        let keyConstructed = keys.filter(k => { if (rowObj[k]) return true; }).map(k => { return rowObj[k]; }).join('|');
        let obj = {};

        for (let x of keys)
            if (rowObj[x]) obj[x] = rowObj[x];

        return [keyConstructed, obj];
    });

    if (options.object) {
        let obj = {};
        for (let x of holdArray)
            obj[x[0]] = x[1];

        return obj;
    }

    let map = new Map(holdArray);
    return Array.from(map.values());
};

moduleJS.keyValues = function (target, key) {
    let output = [];
    for (let x of target) {
        output.push(x[key]);
    }
    return output;
};

moduleJS.addArrayCheck = function (arr, check) {
    if (!Array.isArray(check)) {
        if (!arr.includes(check))
            arr.push(check);
    }
    else
        for (let x of check)
            if (!arr.includes(x))
                arr.push(x);

};

moduleJS.pivot = function (target, optionsObj) {
    let output = moduleJS.uniqueValues(target, optionsObj.keysPivot, { object: true });

    optionsObj.keysExclude = optionsObj.keysExclude || [];
    optionsObj.keysTitle = optionsObj.keysTitle || [];

    for (let x of target) {
        let keyConstructed = optionsObj.keysPivot.filter(k => { if (x[k]) return true; }).map(k => { return x[k]; }).join('|');
        let titleConstructed = optionsObj.keyIdentifier.filter(k => { if (x[k]) return true; }).map(k => { return x[k]; }).join('|');

        for (let y in x) {
            if (!optionsObj.keyIdentifier.length || (!optionsObj.keysPivot.includes(y) && !optionsObj.keysTitle.includes(y) && !optionsObj.keyIdentifier.includes(y) && !optionsObj.keysExclude.includes(y))) {
                let key = '';
                switch (optionsObj.method) {
                    case 'suffix':
                        key = optionsObj.keyIdentifier.length ? `${y}${x[optionsObj.keyIdentifier]}` : y;
                        output[keyConstructed][key] = x[y];
                        break;
                    default:
                        key = optionsObj.keyIdentifier.length ? `${titleConstructed}|${y}` : y;
                        output[keyConstructed][key] = x[y];
                        break;
                }
            }
        }
    }

    return Object.values(output);
};

moduleJS.isFunction = function (object) {
    return typeof (object) === 'function';
};

moduleJS.isFunctionAsync = function (object) {
    return (typeof (object) === 'function' && (object).constructor.name === 'AsyncFunction');
};


moduleJS.createFunction = function (code) {
    try {
        return Function(`"use strict"; return ${code};`)();
    }
    catch (err) {
        console.log(err);
    }
};

module.exports =  moduleJS;