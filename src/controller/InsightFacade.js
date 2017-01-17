"use strict";
var Util_1 = require("../Util");
var JSZip = require("jszip");
var fs = require("fs");
var InsightFacade = (function () {
    function InsightFacade() {
        Util_1.default.trace('InsightFacadeImpl::init()');
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        return new Promise(function (fulfill, reject) {
            var zip = new JSZip();
            fs.readFile("Archive.zip", function (err, data) {
                if (err)
                    reject(0);
                JSZip.loadAsync(data).then(function (zip) {
                    console.log(zip);
                    console.log(err);
                    console.log(data);
                });
            });
            fulfill(0);
        });
    };
    InsightFacade.prototype.removeDataset = function (id) {
        return new Promise(function (fulfill, reject) {
            fulfill(0);
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        return new Promise(function (fulfill, reject) {
            fulfill(0);
        });
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map