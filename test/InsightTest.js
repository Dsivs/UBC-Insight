"use strict";
var InsightFacade_1 = require("../src/controller/InsightFacade");
var chai_1 = require('chai');
var Util_1 = require("../src/Util");
var util_1 = require("util");
var JSZip = require("jszip");
var fs = require("fs");
var content = "";
var invalidContent = "";
describe("InsightTest", function () {
    this.timeout(500000);
    var insight = new InsightFacade_1.default();
    var validQuery = {
        "WHERE": {
            "GT": {
                "courses_avg": 97
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_avg"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };
    before(function (done) {
        Util_1.default.test('Before: ' + this.test.parent.title);
        var zip = new JSZip();
        fs.readFile('./test/demo.zip', function (err, data) {
            if (err) {
                console.log(err);
            }
            else if (!util_1.isUndefined(data) || data !== null) {
                content = data.toString('base64');
                console.log("Before: content is done!");
            }
        });
        fs.readFile('./test/invalidContent.zip', function (err, data) {
            if (err) {
                console.log(err);
            }
            else if (!util_1.isUndefined(data) || data !== null) {
                invalidContent = data.toString('base64');
                console.log("Before: Invalidcontent is done!");
            }
        });
        done();
    });
    it("add invalid zip", function () {
        return insight.addDataset('test1', 'SW52YWxpZCBTdHJpbmc=')
            .then(function (response) {
            console.log(response);
            chai_1.expect.fail();
        }).catch(function (returned) {
            chai_1.expect(returned.code).to.deep.equal(400);
            console.log(returned.body);
        });
    });
    it("add valid zip with invalid content", function () {
        return insight.addDataset('test2', invalidContent)
            .then(function (err) {
            console.log(err);
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.deep.equal(400);
        });
    });
    it("add null", function () {
        return insight.addDataset(null, null)
            .then(function (err) {
            console.log(err);
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.deep.equal(400);
        });
    });
    it("add test3 with null content", function () {
        return insight.addDataset("test3", null)
            .then(function (err) {
            console.log(err);
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.deep.equal(400);
        });
    });
    it("Load valid new data set", function () {
        return insight.addDataset('courses', content)
            .then(function (response) {
            chai_1.expect(response.code).to.deep.equal(204);
            chai_1.expect(response.body).to.deep.equal({});
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("perform valid query", function () {
        return insight.performQuery(validQuery)
            .then(function (response) {
            console.log(response);
            chai_1.expect(response.code).to.deep.equal(200);
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("Overwrite existing data set", function () {
        return insight.addDataset('courses', content)
            .then(function (response) {
            chai_1.expect(response.code).to.deep.equal(201);
            chai_1.expect(response.body).to.deep.equal({});
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
        });
    });
    it("Load invalid data set", function () {
        return insight.addDataset('loadInvalid', 'INVALID')
            .then(function (response) {
            console.log(response);
            chai_1.expect.fail();
        }).catch(function (returned) {
            chai_1.expect(returned.code).to.deep.equal(400);
            chai_1.expect(returned.body).to.deep.equal({ "error": "Content Not Base64 Encoded" });
        });
    });
    it("remove a valid new data set", function () {
        return insight.removeDataset('courses')
            .then(function (response) {
            chai_1.expect(response.code).to.deep.equal(204);
            chai_1.expect(response.body).to.deep.equal({});
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
        });
    });
    it("remove non-existing data set", function () {
        return insight.removeDataset('courses')
            .then(function (err) {
            console.log(err);
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.deep.equal(404);
            chai_1.expect(response.body).to.deep.equal({ "error": "Source not previously added" });
        });
    });
});
//# sourceMappingURL=InsightTest.js.map