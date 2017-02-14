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

describe("Room Controller Test", function () {

    this.timeout(500000);
    var controller = new InsightFacade();
    const room = new DataController();
    before(function (done) {

        Log.test('Before: ' + (<any>this).test.parent.title);
        fs.readFile('./zips/roomDemo.zip', function (err: any, data: any) {
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
        return controller.addDataset('rooms', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    /*it("fetch geo", function (done) {
        let res =  room.fetchGeo("SAMPLE ADDRESS, Vancouver, BC")
        done();
        console.log(res);
    });*/

});

