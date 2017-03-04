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

describe("View Test", function () {

    this.timeout(50000);
    let insight = new InsightFacade();

    /**
     * invalid View Query
     */
    const invalidViewQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS": [
                "courses_dept",
                "courses_avg"
            ],
            "ORDER": "courses_avg",
            "FORM": "gg"
        }
    };
    it("invalid view Query", function() {
        return insight.performQuery(invalidViewQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "gg is not equal to TABLE"});
            })
    });
});

