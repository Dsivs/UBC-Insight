/**
 * Created by Axiaz on 2017-02-12.
 */
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import {expect} from 'chai';
import {isUndefined} from "util";
let fs = require("fs");
let content = "";
const emptyArray: any[] = [];

describe("Filter Test", function() {
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
    it("Load valid data set", function() {
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
     * too many keys Query
     */
    const tooManyKeysQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            },
            "LT":{
                "courses_pass": 10
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
    it("too many keys Query", function() {
        return insight.performQuery(tooManyKeysQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "filter must have only one key"});
            })
    });

    /**
     * invalid key Query
     */
    const invalidKeyQuery = {
        "WHERE":{
            "LOL":{
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
    it("invalid key Query", function() {
        return insight.performQuery(invalidKeyQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "LOL is not a valid key"});
            })
    });

    /**
     * OR/AND is not array Query
     */
    const ORANDnotArrayQuery = {
        "WHERE":{
            "OR": {
                "courses_avg": 90
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
    it("OR/AND is not array Query", function() {
        return insight.performQuery(ORANDnotArrayQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "value of OR must be an array"});
            })
    });

    /**
     * OR/AND is empty array Query
     */
    const ORANDemptyArrayQuery = {
        "WHERE":{
            "AND": emptyArray
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
    it("OR/AND is empty array Query", function() {
        return insight.performQuery(ORANDemptyArrayQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "AND must have at least one key"});
            })
    });

    /**
     * too many properties Query
     */
    const tooManyPropertiesQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97,
                "courses_pass":10
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
    it("too many properties Query", function() {
        return insight.performQuery(tooManyPropertiesQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "GT must have exactly one key"});
            })
    });

    /**
     * no ID Key Query
     */
    const noIDKeyQuery = {
        "WHERE":{
            "GT":{
                "avg":97
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
    it("no ID Query", function() {
        return insight.performQuery(noIDKeyQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "avg is not a valid key"});
            })
    });

    /**
     * not number Query
     */
    const notNumQuery = {
        "WHERE":{
            "GT":{
                "courses_avg": "lol"
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
    it("not number Query", function() {
        return insight.performQuery(notNumQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "value of GT must be a number"});
            })
    });

    /**
     * not string Query
     */
    const notStringQuery = {
        "WHERE":{
            "IS":{
                "courses_dept":97
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
    it("not string Query", function() {
        return insight.performQuery(notStringQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "value of IS must be a string"});
            })
    });

    /**
     * invalid property Query
     */
    const invalidPropertyQuery = {
        "WHERE":{
            "GT":{
                "courses_lol":97
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
    it("invalid property Query", function() {
        return insight.performQuery(invalidPropertyQuery)
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
     * KeyValueMismatchQuery
     */
    const keyValueMismatchQuery = {
        "WHERE":{
            "GT": {
                "courses_dept": 97
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
    it("key value mismatch query", function() {
        return insight.performQuery(keyValueMismatchQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "type of courses_dept does not match with key value: 97"});
            })
    });

    /**
     * flexquery
     */
    const flexQuery = {
        "WHERE":{
            "AND":[
                {
                    "EQ":{
                        "courses_year":2007
                    }
                },
                {
                    "IS":{
                        "courses_dept":"cpsc"
                    }
                },
                {
                    "IS":{
                        "courses_id":"121"
                    }
                }
            ]
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_uuid"
            ],
            "ORDER":"courses_uuid",
            "FORM":"TABLE"
        }
    };
    it("flex Query", function() {
        return insight.performQuery(flexQuery)
            .then(function (result) {
                console.log(result.body);
                expect(result.code).to.deep.equal(200);
                //expect.fail();
            }).catch(function (err) {
                //expect(err.code).to.deep.equal(400);
                console.log(err.body);
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
});