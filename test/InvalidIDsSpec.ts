/**
 * Created by Axiaz on 2017-02-12.
 */
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import {expect} from 'chai';
import {isUndefined} from "util";
let fs = require("fs");
let content = "";

describe("invalid IDs Test", function() {
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
     * missing ID Query
     */
    const missingIDQuery = {
        "WHERE":{
            "GT":{
                "derp_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "derp_dept",
                "derp_avg"
            ],
            "ORDER":"derp_avg",
            "FORM":"TABLE"
        }
    };
    it("missing ID Query", function() {
        return insight.performQuery(missingIDQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(424);
                expect(err.body).to.deep.equal({missing: ["derp"]});
            })
    });

    /**
     * multiple IDs Query
     */
    const multipleIDsQuery = {
        "WHERE":{
            "OR":[
                {
                    "IS": {
                        "courses_dept": "adhe"
                    }
                },
                {
                    "EQ":{
                        "courdses_avg":95
                    }
                }
            ]
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
    it("multiple IDs Query", function() {
        return insight.performQuery(multipleIDsQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(424);
                expect(err.body).to.deep.equal({missing: ["courdses"]});
            })
    });

    /**
     *
     */
    const queryTwoDatasetsQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "rooms_name",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };
    it("query two datasets Query", function() {
        return insight.performQuery(queryTwoDatasetsQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "cannot query multiple datasets"});
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