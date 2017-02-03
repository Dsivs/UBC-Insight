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
let invalidContent: string = "";

describe("InsightTest", function () {

    this.timeout(500000);
    var insight: InsightFacade = new InsightFacade();
    var validQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":71
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

    var complexQuery = {
        "WHERE":{
            "OR":[
                {
                            "GT":{
                                "courses_avg":85
                            }
                },
                {
                    "GT":{
                        "courses_avg":72
                    }
                }
            ]
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }



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
                console.log("Before: content is done!");
            }

        });// end of first fs.readfile for valid content

        fs.readFile('./test/invalidContent.zip', function(err: any, data: any) {
            if (err) {
                //invalid zip file is given
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null) {
                //debug, if given content is invalid
                //since given data is a array buffer, we can convert right away
                invalidContent = data.toString('base64');
                console.log("Before: Invalidcontent is done!");
            }

        });// end of second fs.readfile for invalid content

        done();
    });


    it("add invalid zip", function () {
        return insight.addDataset('test1', 'SW52YWxpZCBTdHJpbmc=')
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(returned) {

                expect(returned.code).to.deep.equal(400);
                console.log(returned.body);
                //expect(response.body).to.deep.equal({"error" : "Invalid Zip file"});
            })
    });

    it("add valid zip with invalid content", function () {
        return insight.addDataset('test2', invalidContent)
            .then(function(err) {
                console.log(err);
                expect.fail();
            }).catch(function(response) {
                expect(response.code).to.deep.equal(400);
                //console.log(response.body);
                //expect(response.body).to.deep.equal({"error" : "Invalid Zip file"});
            })
    });

    it("add null", function () {
        return insight.addDataset(null, null)
            .then(function(err) {
                console.log(err);
                expect.fail();
            }).catch(function(response) {
                expect(response.code).to.deep.equal(400);
                //console.log(response.body);
                //expect(response.body).to.deep.equal({"error" : "Invalid Zip file"});
            })
    });

    it("add test3 with null content", function () {
        return insight.addDataset("test3", null)
            .then(function(err) {
                console.log(err);
                expect.fail();
            }).catch(function(response) {
                expect(response.code).to.deep.equal(400);
                //console.log(response.body);
                //expect(response.body).to.deep.equal({"error" : "Invalid Zip file"});
            })
    });



    it("Load valid new data set", function () {
        return insight.addDataset('courses', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                //console.log(err);
                expect.fail();
            })
    });

    it("perform valid query", function () {

        return insight.performQuery(validQuery)
            .then(function(response) {
                console.log(response.body);
                expect(response.code).to.deep.equal(200);
            }).catch(function(err) {
                expect.fail();
            })
    });

    it("perform valid complex query", function () {

        return insight.performQuery(complexQuery)
            .then(function(response) {
                console.log(response.body);
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
        return insight.addDataset('loadInvalid', 'INVALID')
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
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(404);
                expect(err.body).to.deep.equal({"error": "Source not previously added"});
            })
    });

});

