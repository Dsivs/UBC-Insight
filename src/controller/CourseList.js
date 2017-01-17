"use strict";
var CourseList = (function () {
    function CourseList(str) {
        this.list = [];
    }
    CourseList.prototype.add = function (obj) {
        this.list.push(obj);
    };
    CourseList.prototype.remove = function (obj) {
        this.list.splice(obj);
    };
    CourseList.prototype.removeAll = function () {
        this.list = [];
    };
    CourseList.prototype.setID = function (id) {
        this.id = id;
    };
    CourseList.prototype.getID = function (id) {
        return this.id;
    };
    CourseList.prototype.getSize = function () {
        return this.size;
    };
    return CourseList;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CourseList;
//# sourceMappingURL=CourseList.js.map