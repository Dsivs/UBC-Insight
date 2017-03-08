/**
 * Created by John on 2017-02-08.
 */

import {isUndefined} from "util";
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
const fs = require("fs");
let roomContent: string = "";
let courseContent: string = "";
const emptyArray: any[] = [];
import {expect} from 'chai';

describe("Transformations Query Test", function () {

    this.timeout(50000);
    let insight = new InsightFacade();
    before(function (done) {

        Log.test('Before: ' + (<any>this).test.parent.title);
        fs.readFile('./zips/rooms.zip', function (err: any, data: any) {
            if (err) {
                //invalid zip file is given
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null) {
                //debug, if given content is invalid
                //since given data is a array buffer, we can convert right away
                roomContent = data.toString('base64');
                console.log("Before: content is done!");
            }
        });

        fs.readFile('./zips/courses.zip', function (err: any, data: any) {
            if (err) {
                //invalid zip file is given
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null) {
                //debug, if given content is invalid
                //since given data is a array buffer, we can convert right away
                courseContent = data.toString('base64');
                console.log("Before: content is done!");
                done();
            }
        });
    });

    it("add rooms", function () {
        return insight.addDataset('rooms', roomContent)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });
    it("add courses", function () {
        return insight.addDataset('courses', courseContent)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    /**
     * basic MAX Query
     */
    const basicMAXQuery = {
        "WHERE": {
            "IS": {
                "courses_dept": "math"
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
                    "MAX": "courses_avg"
                }
            }]
        }
    };
    it("basic MAX Query", function() {
        return insight.performQuery(basicMAXQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic MIN Query
     */
    const basicMINQuery = {
        "WHERE": {
            "IS": {
                "courses_dept": "math"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "minAvg"
            ],
            "ORDER": "minAvg",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["courses_dept"],
            "APPLY": [{
                "minAvg": {
                    "MIN": "courses_avg"
                }
            }]
        }
    };
    it("basic MIN Query", function() {
        return insight.performQuery(basicMINQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic AVG Query
     */
    const basicAVGQuery = {
        "WHERE": {
            "IS": {
                "courses_dept": "math"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "avgAvg"
            ],
            "ORDER": "avgAvg",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["courses_dept"],
            "APPLY": [{
                "avgAvg": {
                    "AVG": "courses_avg"
                }
            }]
        }
    };
    it("basic AVG Query", function() {
        return insight.performQuery(basicAVGQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic SUM Query
     */
    const basicSUMQuery = {
        "WHERE": {
            "IS": {
                "courses_dept": "math"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "sumAvg"
            ],
            "ORDER": "sumAvg",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["courses_dept"],
            "APPLY": [{
                "sumAvg": {
                    "SUM": "courses_avg"
                }
            }]
        }
    };
    it("basic SUM Query", function() {
        return insight.performQuery(basicSUMQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic COUNT Query
     */
    const basicCOUNTQuery = {
        "WHERE": {
            "IS": {
                "courses_dept": "math"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "countAvg"
            ],
            "ORDER": "countAvg",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["courses_dept"],
            "APPLY": [{
                "countAvg": {
                    "COUNT": "courses_avg"
                }
            }]
        }
    };
    it("basic COUNT Query", function() {
        return insight.performQuery(basicCOUNTQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * wrong datatype applied Query
     */
    const wrongDatatypeAppliedQuery = {
        "WHERE": {
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
                    "MAX": "courses_dept"
                }
            }]
        }
    };
    it("wrong datatype applied Query", function() {
        return insight.performQuery(wrongDatatypeAppliedQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "MAX must be applied to number data"});
            })
    });

    const flexQuery = {
        "WHERE":{},
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "avgAvg",
                "avgPass",
                "uuid"
            ],
            "ORDER": {
                "dir": "UP",
                "keys": ["uuid"]
            },
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["courses_dept", "courses_instructor"],
            "APPLY": [
                {
                    "avgAvg": {
                        "AVG": "courses_avg"
                    }
                },
                {
                    "avgPass": {
                        "AVG": "courses_pass"
                    }
                },
                {
                    "uuid": {
                        "COUNT": "courses_uuid"
                    }
                }
            ]
        }
    };

    it("flex Query", function() {
        return insight.performQuery(flexQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    it("remove rooms", function () {
        return insight.removeDataset('rooms')
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });
    it("remove courses", function () {
        return insight.removeDataset('courses')
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });
});

