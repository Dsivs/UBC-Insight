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

describe("Room Controller Test", function () {

    this.timeout(500000);
    var insight = new InsightFacade();
    const room = new DataController();
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

    const basicGTQuery = {
        "WHERE":{
            "GT":{
                "rooms_seats":20
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "rooms_seats",
                "rooms_name"
            ],
            "ORDER":"rooms_name",
            "FORM":"TABLE"
        }
    }
    it("query before dataset is added", function() {
        return insight.performQuery(basicGTQuery)
            .then(function (result) {
                expect.fail();
                console.log(result.body);
            }).catch(function (err) {
                console.log(err);
                expect(err.code).to.deep.equal(424);
            })
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

    it("query after dataset is added", function() {
        return insight.performQuery(basicGTQuery)
            .then(function (result) {
                //expect.fail();
                console.log(result.body);
                expect(result.code).to.deep.equal(200);
            }).catch(function (err) {
                console.log(err);
                //expect(err.code).to.deep.equal(424);
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

    it("query after dataset is added", function() {
        return insight.performQuery(basicGTQuery)
            .then(function (result) {
                expect.fail();
                console.log(result.body);
            }).catch(function (err) {
                console.log(err);
                expect(err.code).to.deep.equal(424);
            })
    });

});

