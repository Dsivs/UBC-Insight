/**
 * Created by John on 2017-01-17.
 */
/**
 * Created by rtholmes on 2016-10-31.
 */

import InsightFacade from "../src/controller/InsightFacade";
import {expect} from 'chai';
import Log from "../src/Util";
import {isUndefined} from "util";
let fs = require("fs");
let courseContent: string = "";
let invalidContent: string = "";
let novalidContent: string = "";
let longContent: string = "";

describe("DataTest", function () {

    this.timeout(500000);
    let insight: InsightFacade = new InsightFacade();

    before(function (done) {
        Log.test('Before: ' + (<any>this).test.parent.title);
        fs.readFile('./zips/courses.zip', function(err: any, data: any){
            if (err) {
                //invalid zip file is given
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null)
            {
                //debug, if given content is invalid
                //since given data is a array buffer, we can convert right away
                courseContent = data.toString('base64');
                console.log("Before: content is done!");
            }
        });

        fs.readFile('./zips/novalid.zip', function(err: any, data: any){
            if (err) {
                //invalid zip file is given
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null)
            {
                //debug, if given content is invalid
                //since given data is a array buffer, we can convert right away
                novalidContent = data.toString('base64');
                console.log("Before: content is done!");
            }
        });

        fs.readFile('./zips/invalidContent.zip', function(err: any, data: any) {
            if (err) {
                //invalid zip file is given
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null) {
                //debug, if given content is invalid
                //since given data is a array buffer, we can convert right away
                invalidContent = data.toString('base64');
                console.log("Before: Invalidcontent is done!");
                done()
            }
        });
    });

    it("call util functions", function() {
        Log.info("hi");
        Log.warn("hi");
        Log.error("hi");
    })

    it("add invalid zip", function() {
        return insight.addDataset('test1', 'SW52YWxpZCBTdHJpbmc=')
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    it("add non base64 data", function() {
        //test string has upper/lower letter + number + "="
        //has multiple size of 4 bytes
        //satisfied conditions but not valid base64
        return insight.addDataset('testNoBase64', "InVa=65D")
            .then(function(result) {
                console.log(result);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    it("add valid zip with invalid content", function() {
        return insight.addDataset('courses', invalidContent)
            .then(function(result) {
                console.log(result);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    it("add valid zip with no valid content", function() {
        return insight.addDataset('courses', novalidContent)
            .then(function(result) {
                console.log(result);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });


    it("add null to null", function() {
        return insight.addDataset(null, null)
            .then(function(result) {
                console.log(result);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    it("add null content", function() {
        return insight.addDataset("rooms", null)
            .then(function(result) {
                console.log(result);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    it("Load valid new data set", function() {
        return insight.addDataset('courses', courseContent)
            .then(function(response) {
                console.log(response);
                expect(response.code).to.deep.equal(204);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("overwrite valid existing data set", function() {
        return insight.addDataset('courses', courseContent)
            .then(function(response) {
                console.log(response);
                expect(response.code).to.deep.equal(201);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("remove a valid data set", function() {
        return insight.removeDataset('courses')
            .then(function(response) {
                console.log(response);
                expect(response.code).to.deep.equal(204);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });


    it("non existing remove", function() {
        return insight.removeDataset('new courses')
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(404);
                console.log(err);
            })
    });

    it("remove null", function() {
        return insight.removeDataset(null)
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(err) {
                console.log(err)
                expect(err.code).to.deep.equal(404);
            })
    });

    it("remove undefined", function() {
        return insight.removeDataset(undefined)
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(err) {
                console.log(err)
                expect(err.code).to.deep.equal(404);
            })
    });
});