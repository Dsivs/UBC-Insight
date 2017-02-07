"use strict";
var Util_1 = require("../Util");
var JSZip = require("jszip");
var fs = require("fs");
var InsightFacade = (function () {
    function InsightFacade() {
        Util_1.default.trace('InsightFacadeImpl::init()');
        this.loadedCourses = [];
        this.invalidIDs = [];
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        var instance = this;
        var code = 0;
        return new Promise(function (fulfill, reject) {
            instance.parseToZip(content)
                .then(function (zipContents) {
                return Promise.all(instance.readContents(zipContents));
            })
                .then(function (arrayOfFileContents) {
                return instance.parseFileContents(arrayOfFileContents);
            })
                .then(function (arrayOfJSONObj) {
                return instance.parseIntoResult(arrayOfJSONObj);
            })
                .then(function (jsonData) {
                instance.loadedCourses = jsonData;
                return instance.cacheData(JSON.stringify(jsonData, null, 4), id);
            })
                .then(function (result) {
                fulfill(result);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    InsightFacade.prototype.parseToZip = function (content) {
        return new Promise(function (fulfill, reject) {
            var zip = new JSZip();
            zip.loadAsync(content, { base64: true })
                .then(function (result) {
                fulfill(result);
            })
                .catch(function (err) {
                reject({ "code": 400, body: { "error": "Content is not a valid base64 zip" } });
            });
        });
    };
    InsightFacade.prototype.readContents = function (zipContents) {
        var arrayOfFileContents = [];
        for (var filename in zipContents.files) {
            var file = zipContents.file(filename);
            if (file != null) {
                arrayOfFileContents.push(file.async("string"));
            }
        }
        return arrayOfFileContents;
    };
    InsightFacade.prototype.parseFileContents = function (arrayOfFileContents) {
        return new Promise(function (fulfill, reject) {
            var arrayOfJSONObj = [];
            for (var _i = 0, arrayOfFileContents_1 = arrayOfFileContents; _i < arrayOfFileContents_1.length; _i++) {
                var fileContent = arrayOfFileContents_1[_i];
                try {
                    arrayOfJSONObj.push(JSON.parse(fileContent));
                }
                catch (err) {
                }
            }
            if (arrayOfJSONObj.length == 0) {
                reject({ "code": 400, "body": { "error": "Zip contained no valid data" } });
            }
            else {
                fulfill(arrayOfJSONObj);
            }
        });
    };
    InsightFacade.prototype.parseIntoResult = function (arrayOfJSONObj) {
        var finalResult = [];
        return new Promise(function (fulfill, reject) {
            for (var _i = 0, arrayOfJSONObj_1 = arrayOfJSONObj; _i < arrayOfJSONObj_1.length; _i++) {
                var jsonObj = arrayOfJSONObj_1[_i];
                var jsonObjResultProp = jsonObj.result;
                if (Array.isArray(jsonObjResultProp)) {
                    for (var _a = 0, jsonObjResultProp_1 = jsonObjResultProp; _a < jsonObjResultProp_1.length; _a++) {
                        var section = jsonObjResultProp_1[_a];
                        var course = {
                            "courses_dept": section.Subject,
                            "courses_id": section.Course,
                            "courses_avg": section.Avg,
                            "courses_instructor": section.Professor,
                            "courses_title": section.Title,
                            "courses_pass": section.Pass,
                            "courses_fail": section.Fail,
                            "courses_audit": section.Audit,
                            "courses_uuid": section.id.toString()
                        };
                        finalResult.push(course);
                    }
                }
            }
            if (finalResult.length == 0) {
                reject({ "code": 400, "body": { "error": "Zip contained no valid data" } });
            }
            else {
                fulfill(finalResult);
            }
        });
    };
    InsightFacade.prototype.cacheData = function (jsonData, id) {
        var fs = require("fs");
        var path = "./cache/";
        var code = 201;
        return new Promise(function (fulfill, reject) {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
            path = path + id + "/";
            if (!fs.existsSync(path)) {
                code = 204;
                fs.mkdirSync(path);
            }
            path = path + id + ".JSON";
            fs.writeFile(path, jsonData, function (err) {
                if (err) {
                }
                else {
                    fulfill({ "code": code, "body": {} });
                }
            });
        });
    };
    InsightFacade.prototype.removeDataset = function (id) {
        var instance = this;
        instance.loadedCourses.length = 0;
        instance.invalidIDs.length = 0;
        var path = "./cache/" + id + "/";
        return new Promise(function (fulfill, reject) {
            instance.readFilesInDir(path)
                .then(function (files) {
                console.log(files);
                return Promise.all(instance.deleteFilesInDir(files, path));
            })
                .then(function (result) {
                return instance.removeDirectory(path);
            })
                .then(function (result2) {
                fulfill(result2);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    InsightFacade.prototype.readFilesInDir = function (path) {
        return new Promise(function (fulfill, reject) {
            fs.readdir(path, function (err, files) {
                if (err) {
                    reject({ code: 404, "body": { "error": "source not previously added" } });
                }
                else {
                    fulfill(files);
                }
            });
        });
    };
    InsightFacade.prototype.deleteFilesInDir = function (files, path) {
        var results = [];
        var _loop_1 = function(file) {
            results.push(new Promise(function (fulfill, reject) {
                fs.unlink(path + file, function (err) {
                    if (err) {
                    }
                    fulfill({ code: 204, body: {} });
                });
            }));
        };
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            _loop_1(file);
        }
        return results;
    };
    InsightFacade.prototype.removeDirectory = function (path) {
        return new Promise(function (fulfill, reject) {
            fs.rmdir(path, function (err) {
                if (err) {
                }
                fulfill({ code: 204, body: {} });
            });
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        var instance = this;
        var resultsArray = [];
        instance.invalidIDs = [];
        return new Promise(function (fulfill, reject) {
            var where = query.WHERE;
            var options = query.OPTIONS;
            try {
                if (where == undefined)
                    throw ({ code: 400, body: { error: "WHERE is missing" } });
                if (options == undefined)
                    throw ({ code: 400, body: { error: "OPTIONS is missing" } });
                instance.checkOptions(options);
                var filterFun = instance.parseFilter(where);
                for (var _i = 0, _a = instance.loadedCourses; _i < _a.length; _i++) {
                    var course = _a[_i];
                    if (filterFun(course)) {
                        resultsArray.push(course);
                    }
                }
                var columns = options.COLUMNS;
                var outputArray = JSON.parse(JSON.stringify(resultsArray, columns, 4));
                var order_1 = options.ORDER;
                if (order_1 != undefined) {
                    outputArray.sort(function (a, b) {
                        if (a[order_1] > b[order_1]) {
                            return 1;
                        }
                        else if (a[order_1] < b[order_1]) {
                            return -1;
                        }
                        return 0;
                    });
                }
                fulfill({ code: 200, body: { render: 'TABLE', result: outputArray } });
            }
            catch (err) {
                reject(err);
            }
        });
    };
    InsightFacade.prototype.checkOptions = function (options) {
        var columns = options.COLUMNS;
        var order = options.ORDER;
        var form = options.FORM;
        if (!Array.isArray(columns)) {
            throw ({ code: 400, body: { error: "columns must be an array" } });
        }
        if (columns.length == 0) {
            throw ({ code: 400, body: { error: "columns cannot be empty" } });
        }
        if (order != undefined && !columns.includes(order)) {
            throw ({ code: 400, body: { error: order + " is not in " + columns } });
        }
        if (form != "TABLE") {
            throw ({ code: 400, body: { error: form + " is not equal to TABLE" } });
        }
        for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
            var column = columns_1[_i];
            if (!column.includes("_"))
                throw ({ code: 400, body: { error: column + " is not a valid key" } });
            var id = column.substring(0, column.indexOf("_"));
            if (id != "courses") {
                this.invalidIDs.push(id);
                throw ({ code: 424, body: { missing: this.invalidIDs } });
            }
        }
    };
    InsightFacade.prototype.parseFilter = function (filter) {
        var instance = this;
        var numKeys = Object.keys(filter).length;
        if (numKeys != 1)
            throw ({ code: 400, body: { error: "filter must have only one key" } });
        var key = Object.keys(filter)[0];
        var keyValue = filter[key];
        switch (key) {
            case "OR":
            case "AND":
                var arrayOfFilterFn_1 = [];
                if (!Array.isArray(keyValue))
                    throw ({ code: 400, body: { error: "value of " + key + " must be an array" } });
                if (keyValue.length == 0)
                    throw ({ code: 400, body: { error: key + " must have at least one key" } });
                for (var _i = 0, keyValue_1 = keyValue; _i < keyValue_1.length; _i++) {
                    var filter_1 = keyValue_1[_i];
                    arrayOfFilterFn_1.push(instance.parseFilter(filter_1));
                }
                switch (key) {
                    case "OR":
                        return function (CourseObj) {
                            var result = false;
                            for (var _i = 0, arrayOfFilterFn_2 = arrayOfFilterFn_1; _i < arrayOfFilterFn_2.length; _i++) {
                                var filter_2 = arrayOfFilterFn_2[_i];
                                result = result || filter_2(CourseObj);
                            }
                            return result;
                        };
                    case "AND":
                        return function (CourseObj) {
                            var result = true;
                            for (var _i = 0, arrayOfFilterFn_3 = arrayOfFilterFn_1; _i < arrayOfFilterFn_3.length; _i++) {
                                var filter_3 = arrayOfFilterFn_3[_i];
                                result = result && filter_3(CourseObj);
                            }
                            return result;
                        };
                }
            case "GT":
            case "EQ":
            case "LT":
            case "IS":
                var paramFieldLength = Object.keys(keyValue).length;
                if (paramFieldLength != 1)
                    throw ({ code: 400, body: { error: key + " must have exactly one key" } });
                var paramField_1 = Object.keys(keyValue)[0];
                var paramValue_1 = keyValue[paramField_1];
                if (!paramField_1.includes("_"))
                    throw ({ code: 400, body: { error: paramField_1 + " is not a valid key" } });
                var id = paramField_1.substring(0, paramField_1.indexOf("_"));
                if (id != "courses") {
                    if (!this.invalidIDs.includes(id))
                        this.invalidIDs.push(id);
                    throw ({ code: 424, body: { missing: this.invalidIDs } });
                }
                switch (key) {
                    case "GT":
                    case "EQ":
                    case "LT":
                        if (typeof paramValue_1 != "number")
                            throw ({ code: 400, body: { error: "value of " + key + " must be a number" } });
                        break;
                    case "IS":
                        if (typeof paramValue_1 != "string")
                            throw ({ code: 400, body: { error: "value of " + key + " must be a string" } });
                        break;
                }
                return function (courseObj) {
                    if (courseObj[paramField_1] === undefined)
                        throw ({ code: 400, body: { error: paramField_1 + " is not a valid key" } });
                    switch (key) {
                        case "GT":
                            return courseObj[paramField_1] > paramValue_1;
                        case "EQ":
                            return courseObj[paramField_1] == paramValue_1;
                        case "LT":
                            return courseObj[paramField_1] < paramValue_1;
                        case "IS":
                            var firstWild = paramValue_1.startsWith("*");
                            var secondWild = paramValue_1.endsWith("*");
                            if (firstWild && secondWild) {
                                return courseObj[paramField_1].includes(paramValue_1.substring(1, paramValue_1.length - 1));
                            }
                            else if (firstWild) {
                                return courseObj[paramField_1].endsWith(paramValue_1.substring(1));
                            }
                            else if (secondWild) {
                                return courseObj[paramField_1].startsWith(paramValue_1.substring(0, paramValue_1.length - 1));
                            }
                            else {
                                return courseObj[paramField_1] === paramValue_1;
                            }
                    }
                };
            case "NOT":
                var filterFn_1 = instance.parseFilter(keyValue);
                return function (courseObj) {
                    return !filterFn_1(courseObj);
                };
            default:
                throw ({ code: 400, body: { error: key + " is not a valid key" } });
        }
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map