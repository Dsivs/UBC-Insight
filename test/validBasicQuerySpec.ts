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

describe("QueryTest", function() {
    this.timeout(500000);
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
     * ORDER is missing
     */
    const noOrderQuery = {
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
            "FORM":"TABLE"
        }
    };
    it("ORDER is missing Query", function() {
        return insight.performQuery(noOrderQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic GT Query
     */
    const basicGTQuery = {
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
    }
    it("basic GT Query", function() {
        return insight.performQuery(basicGTQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic EQ Query
     */
    const basicEQQuery = {
        "WHERE":{
            "EQ":{
                "courses_avg":92
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
    }
    it("basic EQ Query", function() {
        return insight.performQuery(basicEQQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic LT Query
     */
    const basicLTQuery = {
        "WHERE":{
            "LT":{
                "courses_avg":50
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
    }
    it("basic LT Query", function() {
        return insight.performQuery(basicLTQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic IS no wildcard Query
     */
    const basicISnoWildQuery = {
        "WHERE":{
            "IS":{
                "courses_dept":"mtrl"
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
    }
    it("basic IS no wildcard Query", function() {
        return insight.performQuery(basicISnoWildQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic IS front wildcard Query
     */
    const basicISfrontWildQuery = {
        "WHERE":{
            "IS":{
                "courses_dept":"*trl"
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
    }
    it("basic IS front wildcard Query", function() {
        return insight.performQuery(basicISfrontWildQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic IS back wildcard Query
     */
    const basicISbackWildQuery = {
        "WHERE":{
            "IS":{
                "courses_dept":"mtr*"
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
    }
    it("basic IS back wildcard Query", function() {
        return insight.performQuery(basicISbackWildQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic IS both wildcard Query
     */
    const basicISbothWildQuery = {
        "WHERE":{
            "IS":{
                "courses_dept":"*tr*"
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
    }
    it("basic IS both wildcard Query", function() {
        return insight.performQuery(basicISbothWildQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic NOT Query
     */
    const basicNOTQuery = {
        "WHERE":{
            "NOT": {
                "GT":{
                    "courses_avg":30
                }
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
    it("basic NOT Query", function() {
        return insight.performQuery(basicNOTQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic OR Query
     */
    const basicORQuery = {
        "WHERE":{
            "OR":[
                {
                    "IS": {
                        "courses_dept": "adhe"
                    }
                },
                {
                    "EQ":{
                        "courses_avg":95
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
    it("basic OR Query", function() {
        return insight.performQuery(basicORQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic AND Query
     */
    const basicANDQuery = {
        "WHERE":{
            "AND":[
                {
                    "IS": {
                        "courses_dept": "adhe"
                    }
                },
                {
                    "GT":{
                        "courses_avg":93
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
    it("basic AND Query", function() {
        return insight.performQuery(basicANDQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * Complex Query
     */
    const complexQuery = {
        "WHERE":{
            "OR":[
                {
                    "AND":[
                        {
                            "GT":{
                                "courses_avg":90
                            }
                        },
                        {
                            "IS":{
                                "courses_dept":"adhe"
                            }
                        }
                    ]
                },
                {
                    "EQ":{
                        "courses_avg":95
                    }
                }
            ]
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg",
                "courses_id"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }
    it("complex Query", function() {
        return insight.performQuery(complexQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
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
})