/**
 * Created by John on 2017-01-17.
 */
/**
 * Created by rtholmes on 2016-10-31.
 */

import InsightFacade from "../src/controller/InsightFacade";
import {expect} from 'chai';
import Log from "../src/Util";
import {ok} from "assert";
let JSZip = require("jszip");
let fs = require("fs");
let content: string;

describe("InsightTest", function () {

    var insight: InsightFacade = new InsightFacade();

    var zip = new JSZip();
    fs.readFile('./test/Archive.zip',function(err: any, data: any) {
        if (err)
            console.log(err);
        JSZip.loadAsync(data).then(function(okay: any) {
            var b = new Buffer(JSON.stringify(okay));
            content = b.toString('base64');
        }).catch(function (err: any) {
            console.log(err);
        });

    });

    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
    });


    it("Load data set", function () {
        return insight.addDataset('courses', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(201);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });



});

