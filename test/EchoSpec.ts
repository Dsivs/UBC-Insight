/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import {expect} from 'chai';
let chai = require('chai') , chaiHttp = require('chai-http');
chai.use(chaiHttp);
import Log from "../src/Util";
import restify = require('restify');
import {InsightResponse} from "../src/controller/IInsightFacade";
import http = require('http');
import {isUndefined} from "util";
let server = new Server(8080);
let client: any;
let fs = require("fs");
let content:string;
describe("EchoSpec", function () {



    const basicGTQuery = {
        "WHERE":{
            "GT":{
                "courses_avg":0
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

    before(function (done) {
        Log.test('Before: ' + (<any>this).test.parent.title);

        server.start()
            .then(function (result) {
                return result;
            }).then( function(res){
                client = restify.createJsonClient({
                    url: 'http://localhost:8080/'
                });

            fs.readFile('./zips/demo.zip', function(err: any, data: any){
                if (err) {
                    //invalid zip file is given
                    console.log(err);
                }
                else if (!isUndefined(data) || data !== null)
                {
                    //debug, if given content is invalid
                    //since given data is a array buffer, we can convert right away
                    content = data.toString('base64');
                    done();
                }
            });


            }).catch(function (err: any){
                console.log(err);
                expect.fail();
            });
    });

    it('request GET', function(done) {
        //test for GET, sample
        chai.request('http://localhost:8080')
            .get('/')
            .end(function(err: any, res:restify.Response) {
                expect(res.statusCode).to.equal(200);
                done();
            });
    });

    it('request invalid DELETE', function(done) {
        chai.request('http://localhost:8080')
            .del('/dataset/courses')
            .end(function(err: any, res:restify.Response) {
                expect(err.status).to.equal(404);
                done();
            });
    });

    it('request PUT courses', function(done) {
        chai.request('http://localhost:8080')
            .put('/dataset/courses')
            .send({ 'content': content})
            .end(function (err:any, res:any) {
                if(err)
                    expect.fail();
                expect(err).to.be.null;
                //204 = new id
                expect(res).to.have.status(204);
                done();
            });
    });

    it('request POST courses', function() {
        return chai.request('http://localhost:8080')
            .post('/query')
            .send(basicGTQuery)
            .then(function (res:any) {
                //expect(err).to.be.null;
                expect(res).to.have.status(200);
                console.log(res.body);
            });
    });

    it('request DELETE courses', function(done) {
        chai.request('http://localhost:8080')
            .del('/dataset/courses')
            .end(function (err:any, res:any) {
                if(err)
                    expect.fail();
                expect(err).to.be.null;
                //204 = delete ok
                expect(res).to.have.status(204);
                done();
            });
    });


    /*

    it("put invalid base64 content", function () {



        client.put('/dataset/room', {'content': 'invalid64string'} ,
            function (err:any,req:restify.Request,res: restify.Response,obj:any) {
            if (err)
            {
                console.log("req err: " + err);
                expect(err.code).to.equal(400);
                expect(err.body).to.be.deep.equal({"error":"invalid64string is not a valid dataset id."});
            }
            console.log("req from client: " +req);
            console.log("res from server: " +res);
            console.log("random obj stuff: " +obj);
            //invalid content should be returned an error
            expect.fail();
        })
    });


    it("put courses", function () {
        client.put('/dataset/courses', {'content': content} ,
            function (err:any,req:restify.Request,res: restify.Response,obj:any) {
                if (err)
                {
                    console.log("req err: " + err);
                    expect.fail();
                }
                console.log("req from client: " +req);
                console.log("res from server: " +res);
                console.log("random obj stuff: " +obj);
                expect(res.statusCode).to.equal(204);
            })
    });



    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });


    it("Should be able to echo silence", function () {
        let out = Request.performEcho('');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: '...'});
    });

    it("Should be able to handle a missing echo message sensibly", function () {
        let out = Request.performEcho(undefined);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Should be able to handle a null echo message sensibly", function () {
        let out = Request.performEcho(null);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.have.property('error');
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });
    */

    it("stop server", function () {
        server.stop()
            .then(function (result) {
                expect(result).to.equal(true);
            }).catch( function (err) {
                expect.fail();
        });
    });
});