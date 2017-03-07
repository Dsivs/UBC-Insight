/**
 * Created by John on 2017-01-17.
 */
/**
 * Created by rtholmes on 2016-10-31.
 */

import InsightFacade from "../src/controller/InsightFacade";
import {expect} from 'chai';
import Log from "../src/Util";
import {isUndefined} from "util";
let fs = require("fs");
let content: string = "";
let invalidContent: string = "";
let novalidContent: string = "";
let longContent: string = "";

describe("Querying Before/After Adding/Remove Tests", function () {

    this.timeout(500000);
    let insight: InsightFacade = new InsightFacade();

    before(function (done) {
        Log.test('Before: ' + (<any>this).test.parent.title);
        fs.readFile('./zips/courses.zip', function(err: any, data: any){
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
                done();
            }
        });
    });

    const basicCourseQuery = {
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
    const basicRoomQuery = {
        "WHERE":{
            "GT":{
                "rooms_seats":100
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "rooms_name",
                "rooms_seats"
            ],
            "ORDER":"rooms_name",
            "FORM":"TABLE"
        }
    }

    it("course query before dataset is added", function() {
        return insight.performQuery(basicCourseQuery)
            .then(function (result) {
                expect.fail();
                console.log(result.body);
            }).catch(function (err) {
                console.log(err);
                expect(err.code).to.deep.equal(424);
            })
    });

    it("room query before dataset is added", function() {
        return insight.performQuery(basicRoomQuery)
            .then(function (result) {
                expect.fail();
                console.log(result.body);
            }).catch(function (err) {
                console.log(err);
                expect(err.code).to.deep.equal(424);
            })
    });

    it("Load valid new data set", function() {
        return insight.addDataset('courses', content)
            .then(function(response) {
                console.log(response);
                expect(response.code).to.deep.equal(204);
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("course query after dataset added", function() {
        return insight.performQuery(basicCourseQuery)
            .then(function (result) {
                console.log(result.body);
                expect(result.code).to.deep.equal(200);
            }).catch(function (err) {
                console.log(err);
                expect.fail();
            })
    });

    it("room query before dataset is added", function() {
        return insight.performQuery(basicRoomQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err);
                expect(err.code).to.deep.equal(424);
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


    it("query after dataset is removed", function() {
        return insight.performQuery(basicCourseQuery)
            .then(function (result) {
                expect.fail();
                console.log(result.body);
            }).catch(function (err) {
                console.log(err);
                expect(err.code).to.deep.equal(424);
            })
    });

    it("room query before dataset is added", function() {
        return insight.performQuery(basicRoomQuery)
            .then(function (result) {
                expect.fail();
                console.log(result.body);
            }).catch(function (err) {
                console.log(err);
                expect(err.code).to.deep.equal(424);
            })
    });
});