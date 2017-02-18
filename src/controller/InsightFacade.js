"use strict";
var DataController_1 = require("./DataController");
var Util_1 = require("../Util");
var QueryController_1 = require("./QueryController");
var InsightFacade = (function () {
    function InsightFacade() {
        Util_1.default.trace('InsightFacadeImpl::init()');
        this.loadedCourses = [];
        this.loadedRooms = [];
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
                    reject({ code: 400, body: { error: content + " is not a valid dataset id." } });
            }
        });
    };
    InsightFacade.prototype.removeDataset = function (id) {
        var instance = this;
        instance.loadedCourses.length = 0;
        var path = "./cache/" + id + "/";
        return new Promise(function (fulfill, reject) {
            switch (id) {
                case "courses":
                    instance.loadedCourses.length = 0;
                    break;
                case "rooms":
                    instance.loadedRooms.length = 0;
                    break;
                default:
                    console.log("why am i here");
            }
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
        var instance = this;
        var resultsArray = [];
        return new Promise(function (fulfill, reject) {
            instance.queryController.performQuery(query, instance)
                .then(function (result) {
                fulfill(result);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    InsightFacade.prototype.checkMem = function (id) {
        var instance = this;
        switch (id) {
            case "courses":
                if (instance.loadedCourses.length == 0)
                    instance.loadedCourses = instance.dataController.loadCache(id);
                return instance.loadedCourses;
            case "rooms":
                if (instance.loadedRooms.length == 0)
                    instance.loadedRooms = instance.dataController.loadCache(id);
                return instance.loadedRooms;
            default:
                throw ({ code: 424, body: { missing: [id] } });
        }
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map