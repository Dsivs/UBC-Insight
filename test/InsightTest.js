"use strict";
var InsightFacade_1 = require("../src/controller/InsightFacade");
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var JSZip = require("jszip");
var fs = require("fs");
describe("EchoSpec", function () {
    var insight = null;
    before(function () {
        insight = new InsightFacade_1.default();
        var zip = new JSZip();
        fs.readFile("./test/Archive.zip", function (err, data) {
            if (err)
                console.log(err);
            JSZip.loadAsync(data).then(function (zip) {
                console.log(zip);
            });
        });
        Util_1.default.test('Before: ' + this.test.parent.title);
    });
    it("Load data set", function () {
        return insight.addDataset('courses', 'fake data in base68')
            .then(function (response) {
            chai_1.expect(response.code).to.deep.equal(201);
            chai_1.expect(response.body).to.deep.equal({});
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=InsightTest.js.map