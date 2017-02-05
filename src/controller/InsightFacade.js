"use strict";
var Util_1 = require("../Util");
var Course_1 = require("./Course");
var JSZip = require("jszip");
var fs = require("fs");
var pattern = "^[A-Za-z0-9+\/]+$";
var InsightFacade = (function () {
    function InsightFacade() {
        Util_1.default.trace('InsightFacadeImpl::init()');
        this.invalidIDs = [];
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        var instance = this;
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
                    reject({ "code": 400, "body": { "error": "Write File Failed!" } });
                }
                else {
                    fulfill({ "code": code, "body": {} });
                }
            });
        });
    };
    InsightFacade.prototype.removeDataset = function (id) {
        var instance = this;
        var path = "./cache/" + id + "/";
        return new Promise(function (fulfill, reject) {
            instance.removeFolder(path)
                .then(function (result) {
                fulfill(result);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        var instance = this;
        var path;
        instance.invalidIDs = [];
        return new Promise(function (fulfill, reject) {
            instance.getId("./cache")
                .then(function (dir) {
                path = dir;
                return instance.readDataFiles(path);
            })
                .then(function (listOfFiles) {
                return Promise.all(instance.readFiles(listOfFiles, path));
            })
                .then(function (fileContents) {
                return instance.loadCoursesIntoArray(fileContents);
            })
                .then(function (result) {
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
    InsightFacade.prototype.loadCoursesIntoArray = function (fileContents) {
        var instance = this;
        return new Promise(function (fulfill, reject) {
            instance.loadedCourses = [];
            fileContents.forEach(function (fileContent) {
                fileContent.forEach(function (courseSection) {
                    var course = new Course_1.default(courseSection.courses_dept, courseSection.courses_id, courseSection.courses_avg, courseSection.courses_instructor, courseSection.courses_title, courseSection.courses_pass, courseSection.courses_fail, courseSection.courses_audit, courseSection.courses_uuid);
                    instance.loadedCourses.push(course);
                });
            });
            fulfill(0);
        });
    };
    InsightFacade.prototype.readDataFiles = function (path) {
        return new Promise(function (fulfill, reject) {
            fs.readdir(path, function (err, files) {
                if (err)
                    reject({ code: 404, body: { "error": "Source not previously added" } });
                else
                    fulfill(files);
            });
        });
    };
    InsightFacade.prototype.readFiles = function (files, path) {
        var contents = [];
        files.forEach(function (element) {
            contents.push(new Promise(function (fulfill, reject) {
                var url = path + element;
                try {
                    fulfill(JSON.parse(fs.readFileSync(url, 'utf8')));
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
        return contents;
    };
    InsightFacade.prototype.getId = function (path) {
        return new Promise(function (fulfill, reject) {
            if (fs.existsSync(path)) {
                fs.readdirSync(path).forEach(function (file) {
                    var current = path + "/" + file + "/";
                    if (fs.existsSync(current)) {
                        fulfill(current);
                    }
                });
            }
            reject(null);
        });
    };
    InsightFacade.prototype.parseQuery = function (query) {
        var instance = this;
        var filter;
        var options;
        var columns;
        var order = null;
        var form;
        var columnsOnly;
        var queryResults = [];
        var queryOutput = [];
        return new Promise(function (fulfill, reject) {
            if (query.hasOwnProperty('WHERE') && query.hasOwnProperty('OPTIONS')) {
                filter = query.WHERE;
                options = query.OPTIONS;
            }
            else {
                reject({ code: 400, body: { "error": "Invalid Query" } });
            }
            if (options.hasOwnProperty("COLUMNS") && options.hasOwnProperty("FORM")) {
                columns = options.COLUMNS;
                form = options.FORM;
            }
            else {
                reject({ code: 400, body: { "error": "Invalid Query" } });
            }
            if (options.hasOwnProperty("ORDER")) {
                order = options.ORDER;
                if (!columns.includes(order)) {
                    reject({ code: 400, body: { "error": "Invalid Query" } });
                }
            }
            if (form !== 'TABLE') {
                reject({ code: 400, body: { "error": "Invalid Query" } });
            }
            instance.loadedCourses.forEach(function (course) {
                queryResults.push(instance.parseFilter(filter, course));
            });
            Promise.all(queryResults)
                .then(function (result) {
                if (result.length == 0) {
                    fulfill({ code: 200, body: result });
                }
                for (var i = 0; i < instance.loadedCourses.length; i++) {
                    if (result[i] === true) {
                        queryOutput.push(instance.loadedCourses[i]);
                    }
                }
                queryOutput.forEach(function (ele) {
                    columns.forEach(function (column) {
                        if (!ele.hasOwnProperty(column)) {
                            return reject({ code: 400, body: { "error": "Invalid Query" } });
                        }
                    });
                });
                columnsOnly = JSON.parse(JSON.stringify(queryOutput, columns));
                if (order != null) {
                    columnsOnly.sort(function (a, b) {
                        if (a[order] > b[order]) {
                            return 1;
                        }
                        else if (a[order] < b[order]) {
                            return -1;
                        }
                        return 0;
                    });
                }
                fulfill({ code: 200, body: { render: form, result: columnsOnly } });
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    InsightFacade.prototype.parseFilter = function (filter, course) {
        var instance = this;
        return new Promise(function (fulfill, reject) {
            var keys = Object.keys(filter);
            if (keys.length != 1) {
                reject({ code: 400, body: { "error": "Invalid Query" } });
            }
            var key = keys[0];
            switch (key) {
                case "AND":
                    var arrayofFilters = filter[key];
                    if (!Array.isArray(arrayofFilters)) {
                        reject({ code: 400, body: { "error": "Invalid Query" } });
                    }
                    Promise.all(arrayofFilters.map(function (ele) {
                        return instance.parseFilter(ele, course);
                    }))
                        .then(function (result) {
                        result.forEach(function (ele2) {
                            if (ele2 === false) {
                                fulfill(false);
                            }
                        });
                        fulfill(true);
                    })
                        .catch(function (err) {
                        reject(err);
                    });
                    break;
                case "OR":
                    var arrayofFilters = filter[key];
                    if (!Array.isArray(arrayofFilters)) {
                        reject({ code: 400, body: { "error": "Invalid Query" } });
                    }
                    Promise.all(arrayofFilters.map(function (ele) {
                        return instance.parseFilter(ele, course);
                    }))
                        .then(function (result) {
                        result.forEach(function (ele2) {
                            if (ele2 === true) {
                                fulfill(true);
                            }
                        });
                        fulfill(false);
                    })
                        .catch(function (err) {
                        reject(err);
                    });
                    break;
                case "LT":
                case "GT":
                case "EQ":
                case "IS":
                    var filterParams = filter[key];
                    var paramKeys = Object.keys(filterParams);
                    if (paramKeys.length !== 1) {
                        reject({ code: 400, body: { "error": "Invalid Query" } });
                    }
                    else {
                        var paramKey = paramKeys[0];
                        if (paramKey.includes("_")) {
                            var id = paramKey.substr(0, paramKey.indexOf("_"));
                            if (id !== "courses") {
                                if (!instance.invalidIDs.includes(id)) {
                                    instance.invalidIDs.push(id);
                                }
                                reject(({ code: 424, body: { "missing": instance.invalidIDs } }));
                            }
                        }
                        if (course.hasOwnProperty(paramKey)) {
                            var courseValue = course[paramKey];
                            var paramValue = filterParams[paramKey];
                        }
                        else {
                            reject({ code: 400, body: { "error": "Invalid Query" } });
                        }
                        if (key === "IS") {
                            if (typeof paramValue != "string") {
                                reject(({ code: 400, body: { "error": "value of " + key + " must be a string" } }));
                            }
                        }
                        else {
                            if (typeof paramValue != "number") {
                                reject(({ code: 400, body: { "error": "value of " + key + " must be a number" } }));
                            }
                        }
                        instance.doOperation(paramValue, courseValue, key)
                            .then(function (result) {
                            fulfill(result);
                        })
                            .catch(function (err) {
                            reject(err);
                        });
                    }
                    break;
                case "NOT":
                    var filterParams = filter[key];
                    instance.parseFilter(filterParams, course)
                        .then(function (result) {
                        fulfill(!result);
                    })
                        .catch(function (err) {
                        reject(err);
                    });
                    break;
                default:
                    reject({ code: 400, body: { "error": "Invalid Query" } });
            }
        });
    };
    InsightFacade.prototype.doOperation = function (paramValue, courseValue, operation) {
        return new Promise(function (fulfill, reject) {
            switch (operation) {
                case "LT":
                    fulfill(courseValue < paramValue);
                    break;
                case "GT":
                    fulfill(courseValue > paramValue);
                    break;
                case "EQ":
                    fulfill(courseValue === paramValue);
                    break;
                case "IS":
                    var firstWildCard = paramValue.indexOf("*");
                    var lastWildCard = paramValue.lastIndexOf("*");
                    if (firstWildCard == 0) {
                        if (lastWildCard == paramValue.length - 1) {
                            fulfill(courseValue.includes(paramValue.substring(firstWildCard + 1, lastWildCard)));
                        }
                        fulfill(courseValue.endsWith(paramValue.substring(1)));
                    }
                    else if (firstWildCard == -1) {
                        fulfill(courseValue === paramValue);
                    }
                    fulfill(courseValue.startsWith(paramValue.substring(0, lastWildCard)));
                    break;
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
            instance.readDataFiles(path)
                .then(function (files) {
                return Promise.all(instance.removeFiles(path, files));
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
    InsightFacade.prototype.removeFiles = function (path, listofFiles) {
        var output = [];
        listofFiles.forEach(function (file) {
            output.push(new Promise(function (fulfill, reject) {
                fs.unlink(path + file, function (err) {
                    if (err) {
                        reject({ code: 404, body: { "error": "Source not previously added" } });
                    }
                    else {
                        fulfill({ code: 204, body: {} });
                    }
                });
            }));
        });
        return output;
    };
    InsightFacade.prototype.removeDirectory = function (path) {
        return new Promise(function (fulfill, reject) {
            fs.rmdir(path, function (err) {
                if (err) {
                    reject({ code: 400, body: { "error:": "not empty" } });
                }
                fulfill({ code: 204, body: {} });
            });
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
            fulfill(output);
        });
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map