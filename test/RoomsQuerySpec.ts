/**
 * Created by John on 2017-02-08.
 */

import DataController from "../src/controller/DataController";
import {isUndefined} from "util";
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
const fs = require("fs");
let content: string = "";
import {expect} from 'chai';
import {GeoResponse} from "../src/controller/IInsightFacade";

describe("Room Query Test", function () {

    this.timeout(500000);
    var insight = new InsightFacade();
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
                content = data.toString('base64');
                console.log("Before: content is done!");
                done();
            }
        });
    });

    it("add rooms", function () {
        return insight.addDataset('rooms', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    /**
     * Flex Query
     */
    const flexQuery = {
        "WHERE": {
            "IS": {
                "rooms_shortname": "ALRD"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_address", "rooms_name", "rooms_type"
            ],
            "ORDER": "rooms_name",
            "FORM": "TABLE"
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

    const emptyQuery = {
        "WHERE": {
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_address", "rooms_name", "rooms_type"
            ],
            "ORDER": "rooms_name",
            "FORM": "TABLE"
        }
    };
    it("empty filter with multiple IDs Query", function() {
        return insight.performQuery(emptyQuery)
            .then(function (result) {
                console.log(result.body);
                expect(result.code).to.deep.equal(200);
            }).catch(function (err) {
                console.log(err.body);
                expect.fail();
            })
    });


    const multiIDColumnQuery = {
        "WHERE": {
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept", "rooms_name", "rooms_type"
            ],
            "ORDER": "rooms_name",
            "FORM": "TABLE"
        }
    };
    it("columns has multiple ids Query", function() {
        return insight.performQuery(multiIDColumnQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
            })
    });

    const invalidIDColumnQuery = {
        "WHERE": {
        },
        "OPTIONS": {
            "COLUMNS": [
                "dept", "rooms_name", "rooms_type"
            ],
            "ORDER": "rooms_name",
            "FORM": "TABLE"
        }
    };
    it("columns has invalid ID Query", function() {
        return insight.performQuery(invalidIDColumnQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
            })
    });

    const invalidKeyColumnQuery = {
        "WHERE": {
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_dept", "rooms_name", "rooms_type"
            ],
            "ORDER": "rooms_name",
            "FORM": "TABLE"
        }
    };
    it("columns has invalid key Query", function() {
        return insight.performQuery(invalidKeyColumnQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
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

});

