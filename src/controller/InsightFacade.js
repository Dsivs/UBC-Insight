"use strict";
var Util_1 = require("../Util");
var Course_1 = require("./Course");
var CourseList_1 = require("./CourseList");
var util_1 = require("util");
var util_2 = require("util");
var JSZip = require("jszip");
var fs = require("fs");
var pattern = "^[A-Za-z0-9+\/=]+\Z";
var InsightFacade = (function () {
    function InsightFacade() {
        Util_1.default.trace('InsightFacadeImpl::init()');
        this.set = new CourseList_1.default("courses");
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
                    removal = instance.removeDataset(id).catch(function (err) {
                        reject({ code: 400, body: { "error": "Deletion error" } });
                    });
                }
                else {
                    code = 204;
                }
                var caching = instance.decode(content).then(function (decoded) {
                }).catch(function (err) {
                    console.log(err);
                    reject({ code: 400, body: { "error": err.toString() } });
                });
                Promise.all([removal, caching]).then(function () {
                    fulfill({ code: code, body: {} });
                }).catch(function (err) {
                    console.log(err);
                    reject({ code: 400, body: { "error": err.toString() } });
                });
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
            if (!instance.isCached()) {
                reject({ code: 424, body: { "missing": [this.id] } });
            }
            if (query.WHERE === null || query.OPTIONS === null || util_1.isUndefined(query.WHERE) || util_1.isUndefined(query.OPTIONS)) {
                reject({ code: 400, body: { "error": "Invalid query form" } });
            }
            else {
                instance.readDataFiles(path)
                    .then(function (result) {
                    return Promise.all(instance.readFiles(result));
                })
                    .then(function (result2) {
                    result2.forEach(function (element) {
                        element.forEach(function (ele) {
                            var course = new Course_1.default(ele.courses_dept, ele.courses_id, ele.courses_avg, ele.courses_instructor, ele.courses_title, ele.courses_pass, ele.courses_fail, ele.courses_audit, ele.courses_uuid);
                            instance.set.add(course);
                        });
                    });
                    fulfill({ code: 200, body: { "data": "json" } });
                });
            }
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
                var _loop_1 = function () {
                    var name_1 = filename;
                    readfile = okay.file(filename).async("string")
                        .then(function success(text) {
                        if (util_1.isUndefined(text) || (typeof text !== 'string') || !(instance.isJSON(text)))
                            throw util_2.error;
                        var buffer = new Buffer(text);
                        return instance.parseData(buffer.toString());
                    })
                        .then(function (result) {
                        instance.cacheData(result, name_1);
                        content = result;
                    })
                        .catch(function (err) {
                        console.log("err catched for readfile:" + err);
                        reject({ code: 400, body: { "error": "read-file error" } });
                    });
                };
                for (var filename in okay.files) {
                    _loop_1();
                }
                Promise.all([readfile]).then(function () {
                    fulfill(content);
                }).catch(function (err) {
                    reject({ code: 400, body: { "error": err.toString() } });
                });
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
        if (!fs.existsSync("./cache/")) {
            fs.mkdirSync("./cache/");
            console.log("new directory created!");
        }
        if (!util_1.isUndefined(this.id)) {
            if (!fs.existsSync("./cache/" + this.id + "/")) {
                fs.mkdirSync("./cache/" + this.id + "/");
                console.log("new directory created!");
            }
            var path = "./cache/" + this.id + "/" + filename + ".JSON";
            fs.writeFile(path, content, function (err) {
                if (err) {
                    console.error("!!!write error:  " + err.message);
                }
                else {
                    console.log("@Successful Write to " + path);
                }
            });
        }
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
        return new Promise(function (fulfill, reject) {
            if (fs.existsSync(path)) {
                fs.readdirSync(path).forEach(function (file) {
                    var current = path + "/" + file;
                    if (fs.lstatSync(current).isDirectory()) {
                        this.removeFolder(current).catch(function (err) {
                            console.log(err);
                            reject({ code: 400, body: { "error": err.toString() } });
                        });
                    }
                    else {
                        fs.unlinkSync(current);
                    }
                });
                fs.rmdirSync(path);
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