/**
 * Created by John on 2017-01-17.
 */
/**
 * Created by rtholmes on 2016-10-31.
 */

import InsightFacade from "../src/controller/InsightFacade";
import {expect} from 'chai';
import Log from "../src/Util";
import forEach = require("core-js/fn/array/for-each");
import {isUndefined} from "util";
import {QueryRequest} from "../src/controller/IInsightFacade";
let JSZip = require("jszip");
let fs = require("fs");
let content: string = "";

describe("InsightTest", function () {

    this.timeout(500000);
    var insight: InsightFacade = new InsightFacade();
    var validQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };



    before(function (done) {
        Log.test('Before: ' + (<any>this).test.parent.title);
        var zip = new JSZip();
        fs.readFile('./test/demo.zip', function(err: any, data: any){
            if (err) {
                //invalid zip file is given
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null)
            {
                //debug, if given content is invalid
                //since given data is a array buffer, we can convert right away
                content = data.toString('base64');
            }
            /*
            zip.loadAsync(data).then(function(okay: any) {

                for (var filename in okay.files)
                {
                    okay.file(filename).async("string")
                        .then(function success(text: string) {
                            console.log(text);
                            var buffer = new Buffer(text);
                            text = buffer.toString('base64');
                            //debug: so content can be loaded before test starts
                            //no idea why, but somehow works. future editing may needed
                            if (content == "")
                                done();
                           content = content + text;
                    });
                }*/


                //done();
                //second
                //convert to base64
            //});// end of loadAsync.then*/
        done();
        });// end of fs.readfile
        //first

    });


    it("Load valid new data set", function () {
        //console.log(content);
        return insight.addDataset('courses', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("perform valid query", function () {

        return insight.performQuery(validQuery)
            .then(function(response) {
                console.log(response);
                expect(response.code).to.deep.equal(200);
            }).catch(function(err) {
                expect.fail();
            })
    });

    it("Overwrite existing data set", function () {
        return insight.addDataset('courses', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(201);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("Load invalid data set", function () {
        return insight.addDataset('courses', 'INVALID')
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(returned) {
                expect(returned.code).to.deep.equal(400);
                expect(returned.body).to.deep.equal({"error": "Content Not Base64 Encoded"});
            })
    });


    it("remove a valid new data set", function () {
        return insight.removeDataset('courses')
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });


    it("remove non-existing data set", function () {
        return insight.removeDataset('courses')
            .then(function(err) {
                console.log(err);
                expect.fail();
            }).catch(function(response) {
                expect(response.code).to.deep.equal(404);
                expect(response.body).to.deep.equal({"error": "Source not previously added"});
            })
    });

});

