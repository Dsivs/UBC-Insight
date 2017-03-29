"use strict";
var DataController_1 = require("./DataController");
var Util_1 = require("../Util");
var QueryController_1 = require("./QueryController");
var InsightFacade = (function () {
    function InsightFacade() {
        Util_1.default.trace('InsightFacadeImpl::init()');
        this.dataController = new DataController_1.default();
        this.queryController = new QueryController_1.default();
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        var instance = this;
        return new Promise(function (fulfill, reject) {
            switch (id) {
                case "courses":
                    instance.dataController.addCourses(content)
                        .then(function (result) {
                        fulfill(result);
                    })
                        .catch(function (err) {
                        reject(err);
                    });
                    break;
                case "rooms":
                    instance.dataController.addRooms(content)
                        .then(function (result) {
                        fulfill(result);
                    })
                        .catch(function (err) {
                        reject(err);
                    });
                    break;
                default:
                    reject({ code: 400, body: { error: id + " is not a valid dataset id." } });
            }
        });
    };
    InsightFacade.prototype.removeDataset = function (id) {
        var instance = this;
        return new Promise(function (fulfill, reject) {
            instance.dataController.removeDataset((id))
                .then(function (result) {
                fulfill(result);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        console.log("perform query called");
        var instance = this;
        return new Promise(function (fulfill, reject) {
            instance.queryController.performQuery(query, instance)
                .then(function (result) {
                console.log("query ok");
                fulfill(result);
            })
                .catch(function (err) {
                console.log("query rejected");
                console.log(err);
                reject(err);
            });
        });
    };
    InsightFacade.prototype.checkMem = function (id) {
        var instance = this;
        return instance.dataController.loadCache(id);
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map