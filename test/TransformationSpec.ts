/**
 * Created by John on 2017-02-08.
 */

import {isUndefined} from "util";
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
const fs = require("fs");
let roomContent: string = "";
let courseContent: string = "";
import {expect} from 'chai';

describe("Transformation Test", function () {

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
     * no sort Query
     */
    const MAXQuery = {
        "WHERE": {
            "AND": [{
                "IS": {
                    "rooms_furniture": "*Tables*"
                }
            }, {
                "GT": {
                    "rooms_seats": 300
                }
            }]
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_shortname",
                "maxSeats"
            ],
            "ORDER": {
                "dir": "DOWN",
                "keys": ["maxSeats"]
            },
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["rooms_shortname"],
            "APPLY": [{
                "maxSeats": {
                    "MAX": "rooms_seats"
                }
            }]
        }
    };
    it("MAX Query", function() {
        return insight.performQuery(MAXQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * empty APPLY Query
     */
    const emptyArray: any[] = [];
    const emptyAPPLYQuery = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "rooms_furniture"
            ],
            "ORDER": "rooms_furniture",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["rooms_furniture"],
            "APPLY": emptyArray
        }
    };
    it("empty APPLY Query", function() {
        return insight.performQuery(emptyAPPLYQuery)
            .then(function (result) {
                expect(result.code).to.deep.equal(200);
                console.log(result.body);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic ascending sort Query
     */
    const ascendingSortQuery = {
        "WHERE": {
            "IS": {
                "rooms_shortname": "ALRD"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_address", "rooms_name", "rooms_type"
            ],
            "ORDER": {
                dir: "UP",
                keys: ["rooms_name"]
            },
            "FORM": "TABLE"
        }
    };
    it("ascending sort Query", function() {
        return insight.performQuery(ascendingSortQuery)
            .then(function (result) {
                console.log(result.body);
                expect(result.code).to.deep.equal(200);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * basic descending sort Query
     */
    const descendingSortQuery = {
        "WHERE": {
            "IS": {
                "rooms_shortname": "ALRD"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_address", "rooms_name", "rooms_type"
            ],
            "ORDER": {
                dir: "DOWN",
                keys: ["rooms_name"]
            },
            "FORM": "TABLE"
        }
    };
    it("descending sort Query", function() {
        return insight.performQuery(descendingSortQuery)
            .then(function (result) {
                console.log(result.body);
                expect(result.code).to.deep.equal(200);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });

    /**
     * invalid sort dir Query
     */
    const invalidSortDirQuery = {
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
            "ORDER": {
                dir: "lol",
                keys: ["courses_avg"]
            },
            "FORM":"TABLE"
        }
    };
    it("invalid sort dir Query", function() {
        return insight.performQuery(invalidSortDirQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "dir must be UP or DOWN"});
            })
    });

    /**
     * invalid sort keys Query
     */
    const invalidSortKeysQuery = {
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
            "ORDER": {
                dir: "UP",
                keys: "courses_avg"
            },
            "FORM":"TABLE"
        }
    };
    it("invalid sort keys Query", function() {
        return insight.performQuery(invalidSortKeysQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "keys must be an array of keys"});
            })
    });

    /**
     * order not in columns Query
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
            "ORDER": "courses_asd",
            "FORM":"TABLE"
        }
    };
    it("order not in columns Query", function() {
        return insight.performQuery(orderNotInColumnsQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "courses_asd is not in COLUMNS"})
            })
    });

    /**
     * multiple keys sort Query
     */
    const multiKeySortQuery = {
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
            "ORDER": {
                dir: "UP",
                keys: ["courses_dept", "courses_avg"]
            },
            "FORM":"TABLE"
        }
    };
    it("multiple keys sort Query", function() {
        return insight.performQuery(multiKeySortQuery)
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

