"use strict";
var Util_1 = require("../Util");
var Course_1 = require("./Course");
var util_1 = require("util");
var util_2 = require("util");
var JSZip = require("jszip");
var fs = require("fs");
var pattern = "^[A-Za-z0-9+\/=]+\Z";
var InsightFacade = (function () {
    function InsightFacade() {
        Util_1.default.trace('InsightFacadeImpl::init()');
        this.queryOutput = [];
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        var instance = this;
        this.id = id;
        var code = 0;
        return new Promise(function (fulfill, reject) {
            if (!(instance.isBase64(content)))
                reject({ code: 400, body: { "error": "Content Not Base64 Encoded" } });
            else {
                var removal = void 0;
                if (instance.isExist(id)) {
                    code = 201;
                    removal = instance.removeDataset(id).catch(function () {
                        reject({ code: 400, body: { "error": "Deletion error" } });
                    });
                }
                else {
                    code = 204;
                }
                var caching = instance.decode(content).then(function () {
                }).catch(function (err) {
                    console.log(err);
                    reject({ code: 400, body: { "error": err.toString() } });
                });
                if (removal) {
                    Promise.all([removal, caching]).then(function () {
                        fulfill({ code: code, body: {} });
                    }).catch(function (err) {
                        console.log(err);
                        reject({ code: 400, body: { "error": err.toString() } });
                    });
                }
                else {
                    Promise.all([caching]).then(function () {
                        fulfill({ code: code, body: {} });
                    }).catch(function (err) {
                        console.log(err);
                        reject({ code: 400, body: { "error": err.toString() } });
                    });
                }
            }
        });
    };
    InsightFacade.prototype.removeDataset = function (id) {
        var instance = this;
        this.id = id;
        return new Promise(function (fulfill, reject) {
            var deletion;
            if (!instance.isExist(id))
                reject({ code: 404, body: { "error": "Source not previously added" } });
            else {
                deletion = instance.removeFolder("./cache/" + id + "/");
            }
            Promise.all([deletion]).then(function () {
                fulfill({ code: 204, body: {} });
            }).catch(function () {
                reject({ code: 404, body: { "error": "Source not previously added" } });
            });
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        var instance = this;
        var path = "./cache/courses/";
        return new Promise(function (fulfill, reject) {
            instance.readDataFiles(path)
                .then(function (listOfFiles) {
                return Promise.all(instance.readFiles(listOfFiles));
            })
                .then(function (fileContents) {
                instance.loadedCourses = [];
                fileContents.forEach(function (fileContent) {
                    fileContent.forEach(function (courseSection) {
                        var course = new Course_1.default(courseSection.courses_dept, courseSection.courses_id, courseSection.courses_avg, courseSection.courses_instructor, courseSection.courses_title, courseSection.courses_pass, courseSection.courses_fail, courseSection.courses_audit, courseSection.courses_uuid);
                        instance.loadedCourses.push(course);
                    });
                });
                return instance.parseQuery(query);
            })
                .then(function (result) {
                fulfill(result);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    InsightFacade.prototype.readDataFiles = function (path) {
        return new Promise(function (fulfill, reject) {
            fs.readdir(path, function (err, files) {
                if (err)
                    reject(err);
                else
                    fulfill(files);
            });
        });
    };
    InsightFacade.prototype.readFiles = function (files) {
        var contents = [];
        var path = "./cache/courses/";
        files.forEach(function (element) {
            contents.push(new Promise(function (fulfill, reject) {
                var url = path + element;
                console.log(url);
                fs.readFile(url, 'utf8', function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        fulfill(JSON.parse(data));
                    }
                });
            }));
        });
        return contents;
    };
    InsightFacade.prototype.parseQuery = function (query) {
        var instance = this;
        var filter;
        var options;
        var columns;
        var order = null;
        var form;
        return new Promise(function (fulfill, reject) {
            try {
                filter = query.WHERE;
                options = query.OPTIONS;
            }
            catch (err) {
                reject({ code: 400, body: { "error": "Invalid Query" } });
            }
            console.log(filter);
            console.log(options);
            try {
                columns = options.COLUMNS;
                form = options.FORM;
            }
            catch (err) {
                reject({ code: 400, body: { "error": "Invalid Query" } });
            }
            try {
                order = options.ORDER;
            }
            catch (err) {
            }
            console.log(columns + " " + order + " " + form);
            instance.parseFilter(filter)
                .then(function (result) {
                if (result.length == 0) {
                    console.log("GGG");
                    fulfill({ code: 200, body: { "error": "No Results Returned" } });
                }
                fulfill({ code: 200, body: { "data": "json" } });
                console.log(JSON.stringify(result, null, 4));
            })
                .catch(function (err) {
                reject({ code: 400, body: { "error": "Invalid Query" } });
            });
        });
    };
    InsightFacade.prototype.parseFilter = function (filter) {
        var instance = this;
        return new Promise(function (fulfill, reject) {
            var keys = Object.keys(filter);
            if (keys.length != 1) {
                reject({ code: 400, body: { "error": "Invalid Query" } });
            }
            var key = keys[0];
            console.log(filter);
            console.log(keys);
            console.log(key);
            switch (key) {
                case "AND":
                    break;
                case "OR":
                    break;
                case "LT":
                    break;
                case "GT":
                    var filterParams = filter[key];
                    console.log(filterParams);
                    instance.parseKeyValues(key, filterParams)
                        .then(function (result) {
                        fulfill(result);
                    })
                        .catch(function (err) {
                        reject({ code: 400, body: { "error": "Invalid Key:Value" } });
                    });
                    break;
                case "EQ":
                    break;
                case "IS":
                    break;
                case "NOT":
                    break;
                default:
                    reject({ code: 400, body: { "error": "Invalid Query" } });
            }
        });
    };
    InsightFacade.prototype.parseKeyValues = function (operation, keyvalues) {
        var instance = this;
        return new Promise(function (fulfill, reject) {
            var keys = Object.keys(keyvalues);
            if (keys.length != 1) {
                reject({ code: 400, body: { "error": "Not exactly 1 Key:Value" } });
            }
            var param = keys[0];
            var value = keyvalues[param];
            console.log(value);
            switch (operation) {
                case "AND":
                    break;
                case "OR":
                    break;
                case "LT":
                    break;
                case "GT":
                    instance.queryOutput = instance.loadedCourses.filter(function (d) {
                        return d.avg() > value;
                    });
                    fulfill(instance.queryOutput);
                    break;
                case "EQ":
                    break;
                case "IS":
                    break;
                case "NOT":
                    break;
                default:
                    reject({ code: 400, body: { "error": "Invalid Query" } });
            }
            fulfill({ code: 200, body: { "data": "json" } });
        });
    };
    InsightFacade.prototype.isBase64 = function (input) {
        if (util_1.isUndefined(input) || input === "" || input === null)
            return false;
        if (input.length % 4 !== 0)
            return false;
        var expression = new RegExp(pattern);
        if (!expression.test(input))
            return false;
        return true;
    };
    InsightFacade.prototype.decode = function (input) {
        var instance = this;
        return new Promise(function (fulfill, reject) {
            var buffer = new Buffer(input, 'base64');
            instance.load(buffer)
                .then(function (okay) {
                var content;
                console.log("before");
                var readfile;
                var dataCache;
                var _loop_1 = function() {
                    var name_1 = filename;
                    readfile = okay.file(filename).async("string")
                        .then(function success(text) {
                        if (util_1.isUndefined(text) || (typeof text !== 'string') || !(instance.isJSON(text)))
                            throw util_2.error;
                        var buffer = new Buffer(text);
                        instance.parseData(buffer.toString())
                            .then(function (result) {
                            dataCache = instance.cacheData(result, name_1)
                                .then(function () {
                                content = result;
                            })
                                .catch(function (err) {
                                reject({ code: 400, body: { "error": "cache data error-catch " +
                                            "cachedata block with error: " + err.toString() } });
                            });
                        })
                            .catch(function (err) {
                            reject({ code: 400, body: { "error": "parse data error-parsedata(buffer) block" } });
                        });
                    })
                        .catch(function (err) {
                        console.log("err catched for readfile:" + err);
                        reject({ code: 400, body: { "error": "read-file error" } });
                    });
                };
                for (var filename in okay.files) {
                    _loop_1();
                }
                if (dataCache) {
                    Promise.all([readfile, dataCache]).then(function () {
                        fulfill(content);
                    }).catch(function (err) {
                        reject({ code: 400, body: { "error": err.toString() } });
                    });
                }
                else {
                    Promise.all([readfile]).then(function () {
                        fulfill(content);
                    }).catch(function (err) {
                        reject({ code: 400, body: { "error": err.toString() } });
                    });
                }
            }).catch(function (err) {
                console.log(err);
                reject({ code: 400, body: { "error": err.toString() } });
            });
        });
    };
    InsightFacade.prototype.load = function (buffer) {
        return new Promise(function (fulfill, reject) {
            var zip = new JSZip();
            zip.loadAsync(buffer).then(function (okay) {
                fulfill(okay);
            }).catch(function (err) {
                reject({ code: 400, body: { "error": err.toString() } });
            });
        });
    };
    InsightFacade.prototype.cacheData = function (content, filename) {
        var instance = this;
        return new Promise(function (fulfill, reject) {
            if (!fs.existsSync("./cache/")) {
                fs.mkdirSync("./cache/");
                console.log("new directory created!");
            }
            if (!util_1.isUndefined(instance.id)) {
                if (!fs.existsSync("./cache/" + instance.id + "/")) {
                    fs.mkdirSync("./cache/" + instance.id + "/");
                    console.log("new directory created!");
                }
                var path = "./cache/" + instance.id + "/" + filename + ".JSON";
                fs.writeFile(path, content, function (err) {
                    if (err)
                        reject({ code: 400, body: { "error": "Write File Failed!" } });
                    else
                        fulfill(0);
                });
            }
        });
    };
    InsightFacade.prototype.isExist = function (id) {
        var path = "./cache/" + id + "/";
        if (fs.existsSync(path)) {
            return true;
        }
        return false;
    };
    InsightFacade.prototype.isCached = function () {
        var path = "./cache/";
        if (fs.existsSync(path)) {
            return true;
        }
        return false;
    };
    InsightFacade.prototype.isJSON = function (str) {
        try {
            JSON.parse(str);
        }
        catch (err) {
            return false;
        }
        return true;
    };
    InsightFacade.prototype.removeFolder = function (path) {
        var instance = this;
        return new Promise(function (fulfill, reject) {
            if (fs.existsSync(path)) {
                fs.readdirSync(path).forEach(function (file) {
                    var current = path + "/" + file;
                    if (fs.lstatSync(current).isDirectory()) {
                        instance.removeFolder(current).catch(function (err) {
                            console.log(err);
                            reject({ code: 400, body: { "error": err.toString() } });
                        });
                    }
                    else {
                        fs.unlinkSync(current);
                    }
                });
                fs.rmdirSync(path);
                fs.rmdirSync("./cache/");
            }
            fulfill();
        });
    };
    InsightFacade.prototype.parseData = function (stringObj) {
        return new Promise(function (fulfill, reject) {
            var jsonObj;
            var output = [];
            try {
                jsonObj = JSON.parse(stringObj);
            }
            catch (err) {
                reject("Not Valid JSON");
            }
            jsonObj.result.forEach(function (element) {
                var course = {
                    "courses_dept": element.Subject,
                    "courses_id": element.Course,
                    "courses_avg": element.Avg,
                    "courses_instructor": element.Professor,
                    "courses_title": element.Title,
                    "courses_pass": element.Pass,
                    "courses_fail": element.Fail,
                    "courses_audit": element.Audit,
                    "courses_uuid": element.id
                };
                output.push(course);
            });
            fulfill(JSON.stringify(output, null, 4));
        });
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map