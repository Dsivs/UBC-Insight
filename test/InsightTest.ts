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
let longContent: string = "";

describe("InsightTest", function () {

    this.timeout(500000);
    var insight: InsightFacade = new InsightFacade();
    var insight2: InsightFacade = new InsightFacade();
    var insight3: InsightFacade = new InsightFacade();
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
                console.log("Before: content is done!");
                done();
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


        //comprehensive course data is for local test only
        //this read is omitted for auto test
        /*
        fs.readFile('./test/courses.zip', function(err: any, data: any) {
            if (err) {
                //invalid zip file is given
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null) {
                //debug, if given content is invalid
                //since given data is a array buffer, we can convert right away
                longContent = data.toString('base64');
                console.log("Before: long content is done!");
                done();
            }

        });// end of third fs.readfile for invalid content*/

    });


    /*it("add invalid zip", function () {
        return insight.addDataset('test1', 'SW52YWxpZCBTdHJpbmc=')
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(returned) {

                expect(returned.code).to.deep.equal(400);
                expect(returned.body).to.have.property('error');
                //console.log(returned.body);
                //expect(response.body).to.deep.equal({"error" : "Invalid Zip file"});
            })
    });

    it("add non base64 data", function () {
        //test string has upper/lower letter + number + "="
        //has multiple size of 4 bytes
        //satisfied conditions but not valid base64
        return insight.addDataset('testNoBase64', "InVa=65D")
            .then(function(err) {
                console.log(err);
                expect.fail();
            }).catch(function(response) {
                expect(response.code).to.deep.equal(400);
                expect(response.body).to.have.property('error');
                //console.log(response.body);
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
                expect(response.body).to.have.property('error');
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
                expect(response.body).to.have.property('error');
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
                expect(response.body).to.have.property('error');
                //console.log(response.body);
                //expect(response.body).to.deep.equal({"error" : "Invalid Zip file"});
            })
    });*/



    it("Load valid new data set", function () {
        return insight.addDataset('courses', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("overwrite valid existing data set", function () {
        return insight.addDataset('courses', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(201);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });
    it("overwrite using new obj", function () {
        return insight2.addDataset('courses', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(201);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                //console.log(err);
                expect.fail();
            })
    });

    it("add 2 new valid data set", function () {
        return insight.addDataset('new courses', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("add 3 new valid data set", function () {
        return insight.addDataset('new 3', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                //console.log(err);
                expect.fail();
            })
    });

    it("add 3 new valid data set", function () {
        return insight3.addDataset('obj3', content)
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
        return insight.addDataset('loadInvalid', 'INVALID')
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(returned) {
                expect(returned.code).to.deep.equal(400);
                expect(returned.body).to.have.property('error');
                expect(returned.body).to.deep.equal({"error": "Content Not Base64 Encoded"});
            })
    });

    it("remove a valid new data set", function () {
        return insight2.removeDataset('courses')
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });


    it("remove non-existing data set", function () {
        return insight3.removeDataset('courses')
            .then(function(err) {
                console.log(err);
                expect.fail();
            }).catch(function(response) {
                expect(response.code).to.deep.equal(404);
                expect(response.body).to.deep.equal({"error": "Source not previously added"});
            })
    });

    it("remove a valid new data set", function () {
        return insight.removeDataset('new courses')
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("non existing remove x1", function () {
        return insight.removeDataset('new courses')
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(404);
                expect(err.body).to.have.property('error');
                console.log(err);
            })
    });
    it("non existing remove x2", function () {
        return insight.removeDataset('new courses')
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(404);
                expect(err.body).to.have.property('error');
            })
    });
    it("non existing remove x3", function () {
        return insight.removeDataset('new courses')
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(404);
                expect(err.body).to.have.property('error');
            })
    });

    it("non existing remove x4", function () {
        return insight.removeDataset('new courses')
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(404);
                expect(err.body).to.have.property('error');
            })
    });

    it("remove a valid new data set", function () {
        return insight.removeDataset('new 3')
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("remove using different obj", function () {
        return insight2.removeDataset('obj3')
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("remove null", function () {
        return insight.removeDataset(null)
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(404);
                expect(err.body).to.have.property('error');
            })
    });

    //comprehensive data set should not be uploaded to Github as instructed
    //so this test is omitted for auto-test
    //test is checked in local, passed
    /*
    it("add long valid new data set", function () {
        return insight.addDataset('abc', longContent)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });*/



});

