/**
 * Created by John on 2017-01-17.
 */
/**
 * Created by rtholmes on 2016-10-31.
 */

import InsightFacade from "../src/controller/InsightFacade";
import {expect} from 'chai';
import Log from "../src/Util";
let JSZip = require("jszip");
let fs = require("fs");

describe("EchoSpec", function () {

    var insight: InsightFacade = null;
    before(function () {

        insight = new InsightFacade();

        var zip = new JSZip();
        fs.readFile("./test/Archive.zip", function(err: any, data: any) {
            if (err)
                console.log(err);
            JSZip.loadAsync(data).then(function (zip: any) {
                console.log(zip);
                //console.log(err);
                //console.log(data);
            });
        });
        Log.test('Before: ' + (<any>this).test.parent.title);
    });


    it("Load data set", function () {
        return insight.addDataset('courses', 'fake data in base68')
            .then(function(response) {
                expect(response.code).to.deep.equal(201);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });



});

