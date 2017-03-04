/**
 * Created by John on 2017-02-08.
 */

import DataController from "../src/controller/DataController";
import {isUndefined} from "util";
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
const fs = require("fs");
let roomContent: string = "";
let courseContent: string = "";
import {expect} from 'chai';
import {GeoResponse} from "../src/controller/IInsightFacade";

describe("check WHERE and OPTIONS are Present Test", function () {

    this.timeout(50000);
    let insight = new InsightFacade();

    /**
     * missing WHERE Query
     */
    const missingWHEREQuery = {
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg"
            ],
            "FORM":"TABLE"
        }
    };
    it("missing WHERE Query", function() {
        return insight.performQuery(missingWHEREQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "WHERE is missing"});
            })
    });

    /**
     * missing OPTIONS Query
     */
    const missingOPTIONSQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":97
            }
        }
    };
    it("missing OPTIONS Query", function() {
        return insight.performQuery(missingOPTIONSQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "OPTIONS is missing"});
            })
    });
});

