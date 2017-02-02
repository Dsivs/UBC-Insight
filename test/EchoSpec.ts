/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import restify = require('restify');
import {InsightResponse} from "../src/controller/IInsightFacade";
import http = require('http');

describe("EchoSpec", function () {


    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
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

    it("Should be able to establish server", function () {
        let ser: Server = new Server(1098);
        ser.start().then(function (status: any) {
            expect(status).to.equal(true);
            })
            .catch(function (err: any){
            console.log(err);
           expect.fail();
        });
    });

    it("Should be able to stop server", function () {
        let ser: Server = new Server(1098);
        ser.start().then(function (status: any) {
            ser.stop().then( function (boo: any) {
                expect(boo).to.equal(true);
            }).catch(function (){
                expect.fail();
            });
            expect(status).to.equal(true);
        })
            .catch(function (err: any){
                //console.log(err);
                expect.fail();
            });
    });

    it("Should be able to force stop server", function () {
        let ser: Server = new Server(1098);

        ser.stop().then( function (status: any) {
            expect(status).to.equal(true);
        }).catch( function(){
            expect.fail();
        })
    });

    it("Should be able to echoing", function () {
        let out = Server.performEcho('echo');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: 'echo...echo'});
    });

    it("Should be able to echo silence", function () {
        let out = Server.performEcho('');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: '...'});
    });

    it("Should be able to handle a missing echo message sensibly", function () {
        let out = Server.performEcho(undefined);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Should be able to handle a null echo message sensibly", function () {
        let out = Server.performEcho(null);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.have.property('error');
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Should be able to echo", function () {
        let server = http.createServer();
        server.on('request', function(request: any, response: any) {
            let out = Server.echo(request, response, null);
            Log.test(JSON.stringify(out));
            sanityCheck(out);
            expect(out.code).to.equal(400);
            expect(out.body).to.have.property('error');
        });
        //expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Should be able to local echo", function () {
        let server = http.createServer();
        let local = new Server(1002);
        local.start().then( function(status: any) {
            server.on('request', function(request: any, response: any) {

                let out = Server.echo(request, response, null);
                Log.test(JSON.stringify(out));
                sanityCheck(out);
                expect(out.code).to.equal(400);
                expect(out.body).to.have.property('error');
            });
        }).catch( function()
        {
           expect.fail();
        });
        //expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

});
