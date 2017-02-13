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
     * WHERE is missing
     */
    const noWhereQuery = {
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avdg"
            ],
            "FORM":"TABLE"
        }
    };
    it("No WHERE Query", function() {
        return insight.performQuery(noWhereQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    /**
     * OPTIONS is missing
     */
    const noOptionsQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        }
    };
    it("No OPTIONS Query", function() {
        return insight.performQuery(noOptionsQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    /**
     * COLUMNS is missing
     */
    const noColumnsQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        },
        "OPTIONS":{
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };
    it("No COLUMNS Query", function() {
        return insight.performQuery(noColumnsQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    /**
     * COLUMNS is not an array
     */
    const columnsNotArrayQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS": "lol",
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };
    it("COLUMNS not array Query", function() {
        return insight.performQuery(columnsNotArrayQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    /**
     * COLUMNS is an empty array
     */
    const columnsEmptyArrayQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS": emptyArray,
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };
    it("COLUMNS is an empty array Query", function() {
        return insight.performQuery(columnsEmptyArrayQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
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
     * ORDER not in COLUMNS
     */
    const orderNotInColumnsQuery = {
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
            "ORDER":"courses_pass",
            "FORM":"TABLE"
        }
    };
    it("ORDER not in COLUMNS Query", function() {
        return insight.performQuery(orderNotInColumnsQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    /**
     * invalid FORMS Query
     */
    const invalidFormQuery = {
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
            "FORM":"LMAO"
        }
    };
    it("invalid FORM Query", function() {
        return insight.performQuery(invalidFormQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
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
                "courses_id",
                "courses_avg"
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
    }
    it("too many keys Query", function() {
        return insight.performQuery(tooManyKeysQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
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
    }
    it("invalid key Query", function() {
        return insight.performQuery(invalidKeyQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
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
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
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
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
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
    }
    it("too many properties Query", function() {
        return insight.performQuery(tooManyPropertiesQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    /**
     * no ID Query
     */
    const noIDQuery = {
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
    }
    it("no ID Query", function() {
        return insight.performQuery(noIDQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
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
                "courses_dept",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }
    it("missing ID Query", function() {
        return insight.performQuery(missingIDQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(424);
                console.log(err.body);
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
    }
    it("not number Query", function() {
        return insight.performQuery(notNumQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
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
    }
    it("not string Query", function() {
        return insight.performQuery(notStringQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
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
    }
    it("invalid property Query", function() {
        return insight.performQuery(invalidPropertyQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
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
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
            })
    });

    /**
     * flexquery
     */
    const flexQuery = {
        "WHERE":{
            "GT":{
                "courses_dept":97
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg",
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }
    it("flex Query", function() {
        return insight.performQuery(flexQuery)
            .then(function (result) {
                console.log(result);
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.deep.equal(400);
                console.log(err.body);
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