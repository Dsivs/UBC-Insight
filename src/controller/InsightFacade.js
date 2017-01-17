"use strict";
var Util_1 = require("../Util");
var InsightFacade = (function () {
    function InsightFacade() {
        Util_1.default.trace('InsightFacadeImpl::init()');
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        return new Promise(function (fulfill, reject) {
            fulfill({ code: 201, body: {} });
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