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

describe("Columns Test", function () {

    this.timeout(50000);
    let insight = new InsightFacade();

    /**
     * invalid Columns Query
     */
    const invalidColumnsQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS": "courses_dept",
            "ORDER": "courses_avg",
            "FORM":"TABLE"
        }
    };
    it("invalid columns Query", function() {
        return insight.performQuery(invalidColumnsQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "COLUMNS must be an array"});
            })
    });

    /**
     * empty Columns Query
     */
    const emptyColumnsQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS": emptyArray,
            "ORDER": "courses_avg",
            "FORM":"TABLE"
        }
    };
    it("empty columns Query", function() {
        return insight.performQuery(emptyColumnsQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "COLUMNS cannot be empty"});
            })
    });

    /**
     * invalid key in Columns Query
     */
    /*
    const invalidKeyInColumnsQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS": ["abc"],
            "ORDER": "courses_avg",
            "FORM":"TABLE"
        }
    };
    it("invalid key in Columns Query", function() {
        return insight.performQuery(invalidKeyInColumnsQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "abc is not a valid key"});
            })
    });
    */
});

