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
let novalidContent: string = "";
let longContent: string = "";

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

    var invalidIDQuery = {
        "WHERE":{
            "GT":{
                "coudrses_avg":71
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

    var invalidValueQuery = {
        "WHERE":{
            "IS":{
                "courses_dept": 12
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

    var invalidKeyQuery = {
        "WHERE":{
            "GT":{
                "courses_avdg":71
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

    var invalidFilterQuery = {
        "WHERE":{
            "BO":{
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

    var invalidColumnsQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":85
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dedpt",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };

    var missingFormQuery = {
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
        }
    };

    var invalidFormQuery = {
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
            "FORM":"TAdBLE"
        }
    };

    var invalidFormQuery2 = {
        "WHERE":{
            "GT":{
                "courses_avg":71
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "dept",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }

    var invalidFormQuery3 = {
        "WHERE":{
            "GT":{
                "courses_avg":71
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courdses_avg"
            ],
            "ORDER":"courdses_avg",
            "FORM":"TABLE"
        }
    }

    var notArrayQuery = {
        "WHERE":{
            "OR":{
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
    }

    var emptyArray: any[] = []

    var emptyArrayQuery = {
        "WHERE":{
            "OR": emptyArray
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

    var tooManyKeysQuery = {
        "WHERE":{
            "GT": {
                "courses_avg": 97,
                "courses_fail": 0
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

    var noIDKeyQuery = {
        "WHERE":{
            "GT": {
                "avg": 97,
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

    var tooManyFiltersQuery = {
        "WHERE":{
            "GT": {
                "courses_avg": 97,
            },
            "EQ": {
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
    }

    var notNumQuery = {
        "WHERE":{
            "LT": {
                "courses_avg": "ayy",
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

    var validLTQuery = {
        "WHERE":{
            "LT": {
                "courses_avg": 60,
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

    var validNotQuery = {
        "WHERE":{
            "NOT": {
                "LT": {
                    "courses_avg": 80,
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
    }

    var ColumnOrderMismatchQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":85
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

    var ISNoWildQuery = {
        "WHERE":{
            "IS":{
                "courses_dept": "span"
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg"
            ],
            "ORDER":"courses_dept",
            "FORM":"TABLE"
        }
    };

    var ISFrontWildQuery = {
        "WHERE":{
            "IS":{
                "courses_dept": "*pan"
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg"
            ],
            "ORDER":"courses_dept",
            "FORM":"TABLE"
        }
    };

    var ISBackWildQuery = {
        "WHERE":{
            "IS":{
                "courses_dept": "sp*"
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg"
            ],
            "ORDER":"courses_dept",
            "FORM":"TABLE"
        }
    };

    var ISBothWildQuery = {
        "WHERE":{
            "IS":{
                "courses_dept": "*p*"
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg"
            ],
            "ORDER":"courses_dept",
            "FORM":"TABLE"
        }
    };

    var ISNoResultQuery = {
        "WHERE":{
            "IS":{
                "courses_dept": "*spa"
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg"
            ],
            "ORDER":"courses_dept",
            "FORM":"TABLE"
        }
    };

    var noOrderQuery = {
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
            "FORM":"TABLE"
        }
    };

    var complexAutoSuiteQuery = {
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

    //sections of a dept
    var ApolloQuery = {
        "WHERE":{
            "IS":{
                "courses_dept": "aanb"
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg"
            ],
            "ORDER":"courses_dept",
            "FORM":"TABLE"
        }
    }

    var missingIDsQuery = {
        "WHERE":{
            "OR":[
                {
                    "AND":[
                        {
                            "GT":{
                                "codurses_avg":90
                            }
                        },
                        {
                            "IS":{
                                "cousrses_dept":"adhe"
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


    before(function (done) {
        Log.test('Before: ' + (<any>this).test.parent.title);
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
        });

        fs.readFile('./test/novalid.zip', function(err: any, data: any){
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
                done()
            }
        });
    });

    it("call util functions", function () {
        Log.info("hi");
        Log.warn("hi");
        Log.error("hi");
    })



    it("add invalid zip", function () {
        return insight.addDataset('test1', 'SW52YWxpZCBTdHJpbmc=')
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(returned) {

                expect(returned.code).to.deep.equal(400);
                expect(returned.body).to.have.property('error');
                console.log(returned.body);
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
                console.log(response.body);
                //expect(response.body).to.deep.equal({"error" : "Invalid Zip file"});
            })
    });


    it("add valid zip with invalid content", function () {
        return insight.addDataset('test2', invalidContent)
            .then(function(result) {
                console.log(result);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.have.property('error');
                console.log(err.body);
                //expect(response.body).to.deep.equal({"error" : "Invalid Zip file"});
            })
    });

    it("add valid zip with no valid content", function () {
        return insight.addDataset('test2', novalidContent)
            .then(function(result) {
                console.log(result);
                expect.fail();
            }).catch(function(err) {
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.have.property('error');
                console.log(err.body);
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
                console.log(response.body);
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
    });



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


    it("perform valid query", function () {
        return insight.performQuery(validQuery)
            .then(function(response) {
                console.log(response.body);
                expect(response.code).to.deep.equal(200);
            }).catch(function(err) {
                console.log(err.body)
                expect.fail();
            })
    });


    it("perform invalid query", function () {

        return insight.performQuery(invalidFilterQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform invalid query", function () {

        return insight.performQuery(invalidFormQuery2)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform invalid query", function () {

        return insight.performQuery(invalidFormQuery3)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(424);
            })
    });

    it("perform invalid query", function () {

        return insight.performQuery(notArrayQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform invalid query", function () {

        return insight.performQuery(emptyArrayQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform invalid query", function () {

        return insight.performQuery(tooManyKeysQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform invalid query", function () {

        return insight.performQuery(noIDKeyQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform too many filters query", function () {

        return insight.performQuery(tooManyFiltersQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform invalid query", function () {

        return insight.performQuery(notNumQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform valid query", function () {

        return insight.performQuery(validLTQuery)
            .then(function(response) {
                console.log(response.body);
                expect(response.code).to.deep.equal(200);
            }).catch(function(err) {
                console.log(err.body)
                expect.fail();
            })
    });


    it("perform valid query", function () {

        return insight.performQuery(validNotQuery)
            .then(function(response) {
                console.log(response.body);
                expect(response.code).to.deep.equal(200);
            }).catch(function(err) {
                console.log(err.body)
                expect.fail();
            })
    });

    it("perform invalid value query", function () {

        return insight.performQuery(invalidValueQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });


    it("perform complex autosuite query", function () {

        return insight.performQuery(complexAutoSuiteQuery)
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

    it("perform missing id query", function () {

        return insight.performQuery(invalidIDQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(424);
            })
    });

    it("perform missing multiple ids query", function () {

        return insight.performQuery(missingIDsQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(424);
            })
    });

    it("perform invalid key query", function () {

        return insight.performQuery(invalidKeyQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform invalid column key query", function () {

        return insight.performQuery(invalidColumnsQuery)
            .then(function(response) {
                console.log(response.body);
                expect(response.code).to.deep.equal(200);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("perform missing form query", function () {

        return insight.performQuery(missingFormQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform invalid form query", function () {

        return insight.performQuery(invalidFormQuery)
            .then(function(response) {
                expect.fail();

            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform column order mismatch query", function () {

        return insight.performQuery(ColumnOrderMismatchQuery)
            .then(function(response) {
                expect.fail();
            }).catch(function(err) {
                console.log(err);
                expect(err.code).to.deep.equal(400);
            })
    });

    it("perform no wild card IS query", function () {

        return insight.performQuery(ISNoWildQuery)
            .then(function(response) {
                console.log(response.body);
                expect(response.code).to.deep.equal(200);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("perform front wild card IS query", function () {

        return insight.performQuery(ISFrontWildQuery)
            .then(function(response) {
                console.log(response.body);
                expect(response.code).to.deep.equal(200);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("perform back wild card IS query", function () {

        return insight.performQuery(ISBackWildQuery)
            .then(function(response) {
                console.log(response.body);
                expect(response.code).to.deep.equal(200);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("perform both wild card IS query", function () {

        return insight.performQuery(ISBothWildQuery)
            .then(function(response) {
                console.log(response.body);
                expect(response.code).to.deep.equal(200);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("perform no result wild card IS query", function () {

        return insight.performQuery(ISNoResultQuery)
            .then(function(response) {
                console.log(response.body);
                expect(response.code).to.deep.equal(200);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });


    it("perform no order query", function () {

        return insight.performQuery(noOrderQuery)
            .then(function(response) {
                console.log(response.body)
                expect(response.code).to.deep.equal(200)
            }).catch(function(err) {
                expect.fail();
            })
    });

    it("perform Apollo query", function () {

        return insight.performQuery(ApolloQuery)
            .then(function(response) {
                console.log(response.body)
                expect(response.code).to.deep.equal(200)
            }).catch(function(err) {
                expect.fail();
            })
    });



    it("remove a valid data set", function () {
        return insight.removeDataset('courses')
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });


    it("non existing remove", function () {
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

    it("remove null", function () {
        return insight.removeDataset(null)
            .then(function(response) {
                console.log(response);
                expect.fail();
            }).catch(function(err) {
                console.log(err)
                expect(err.code).to.deep.equal(404);
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
     });
     */
});