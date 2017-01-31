"use strict";
var InsightFacade_1 = require("../src/controller/InsightFacade");
var chai_1 = require('chai');
var Util_1 = require("../src/Util");
var util_1 = require("util");
var JSZip = require("jszip");
var fs = require("fs");
var content = "";
describe("InsightTest", function () {
    this.timeout(500000);
    var insight = new InsightFacade_1.default();
    before(function (done) {
        Util_1.default.test('Before: ' + this.test.parent.title);
        var zip = new JSZip();
        fs.readFile('./test/demo.zip', function (err, data) {
            if (err) {
                console.log(err);
            }
            else if (!util_1.isUndefined(data) || data !== null) {
                content = data.toString('base64');
            }
            done();
        });
    });
    it("Load valid new data set", function () {
        console.log(content);
        return insight.addDataset('courses', content)
            .then(function (response) {
            chai_1.expect(response.code).to.deep.equal(204);
            chai_1.expect(response.body).to.deep.equal({});
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
        });
    });
    it("perform null query", function () {
        return insight.performQuery({ where: null, options: { columns: ["courses_dept", "courses_id", "courses_avg"], order: "courses_avg", form: "TABLE" } })
            .then(function (response) {
            console.log(response);
            chai_1.expect.fail();
        }).catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
            chai_1.expect(err.body).to.deep.equal({ "error": "Invalid query form" });
        });
    });
    it("perform valid query", function () {
        return insight.performQuery({ where: null, options: null })
            .then(function (response) {
            console.log(response);
            chai_1.expect.fail();
        }).catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
            chai_1.expect(err.body).to.deep.equal({ "error": "Invalid query form" });
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
        return insight.addDataset('courses', 'INVALID')
            .then(function (response) {
            console.log(response);
            chai_1.expect.fail();
        }).catch(function (returned) {
            chai_1.expect(returned.code).to.deep.equal(400);
            chai_1.expect(returned.body).to.deep.equal({ "error": "Content Not Base64 Encoded" });
        });
    });
});
//# sourceMappingURL=InsightTest.js.map