/**
 * Created by Axiaz on 2017-02-12.
 */
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import {expect} from 'chai';
import {isUndefined} from "util";
let fs = require("fs");
let content = "";

describe("invalid Keys Test", function() {
    this.timeout(50000);
    let insight: InsightFacade = new InsightFacade();

    /**
     * Before
     */
    before(function (done) {
        Log.test('Before: ' + (<any>this).test.parent.title);
        fs.readFile('./zips/courses.zip', function(err: any, data: any){
            if (err) {
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null)
            {
                content = data.toString('base64');
                console.log("Before: content is done!");
                done();
            }
        });
    });

    /**
     * load up data for the query tests
     */
    it("add courses", function() {
        return insight.addDataset('courses', content)
            .then(function(response) {
                console.log(response);
                expect(response.code).to.deep.equal(204);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    /**
     * no id key in column Query
     */
    const noIDColumnKeyQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg",
                "derp"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };
    it("no id key in column Query", function() {
        return insight.performQuery(noIDColumnKeyQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "derp is not a valid key"});
            })
    });

    /**
     * invalid key in column Query
     */
    const invalidColumnKeyQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg",
                "courses_lol"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };
    it("invalid key in column Query", function() {
        return insight.performQuery(invalidColumnKeyQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "courses_lol is not a valid key"});
            })
    });

    /**
     * invalid key in APPLY Query
     */
    const invalidApplyKeyQuery = {
        "WHERE": {
            "IS": {
                "courses_dept": "MATH"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "maxAvg"
            ],
            "ORDER": "maxAvg",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["courses_dept"],
            "APPLY": [{
                "maxAvg": {
                    "MAX": "courses_lol"
                }
            }]
        }
    };
    it("invalid key in APPLY Query", function() {
        return insight.performQuery(invalidApplyKeyQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "courses_lol is not a valid key"});
            })
    });

    it("remove courses", function() {
        return insight.removeDataset('courses')
            .then(function(response) {
                console.log(response);
                expect(response.code).to.deep.equal(204);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });
});