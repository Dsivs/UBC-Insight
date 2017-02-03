"use strict";
var Server_1 = require("../src/rest/Server");
var chai_1 = require('chai');
var Util_1 = require("../src/Util");
var http = require('http');
describe("EchoSpec", function () {
    function sanityCheck(response) {
        chai_1.expect(response).to.have.property('code');
        chai_1.expect(response).to.have.property('body');
        chai_1.expect(response.code).to.be.a('number');
    }
    before(function () {
        Util_1.default.test('Before: ' + this.test.parent.title);
    });
    beforeEach(function () {
        Util_1.default.test('BeforeTest: ' + this.currentTest.title);
    });
    after(function () {
        Util_1.default.test('After: ' + this.test.parent.title);
    });
    afterEach(function () {
        Util_1.default.test('AfterTest: ' + this.currentTest.title);
    });
    it("Should be able to establish server", function () {
        var ser = new Server_1.default(1098);
        ser.start().then(function (status) {
            chai_1.expect(status).to.equal(true);
        })
            .catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
        });
    });
    it("Should be able to stop server", function () {
        var ser = new Server_1.default(1098);
        ser.start().then(function (status) {
            ser.stop().then(function (boo) {
                chai_1.expect(boo).to.equal(true);
            }).catch(function () {
                chai_1.expect.fail();
            });
            chai_1.expect(status).to.equal(true);
        })
            .catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("Should be able to force stop server", function () {
        var ser = new Server_1.default(1098);
        ser.stop().then(function (status) {
            chai_1.expect(status).to.equal(true);
        }).catch(function () {
            chai_1.expect.fail();
        });
    });
    it("Should be able to echoing", function () {
        var out = Server_1.default.performEcho('echo');
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(200);
        chai_1.expect(out.body).to.deep.equal({ message: 'echo...echo' });
    });
    it("Should be able to echo silence", function () {
        var out = Server_1.default.performEcho('');
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(200);
        chai_1.expect(out.body).to.deep.equal({ message: '...' });
    });
    it("Should be able to handle a missing echo message sensibly", function () {
        var out = Server_1.default.performEcho(undefined);
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(400);
        chai_1.expect(out.body).to.deep.equal({ error: 'Message not provided' });
    });
    it("Should be able to handle a null echo message sensibly", function () {
        var out = Server_1.default.performEcho(null);
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(400);
        chai_1.expect(out.body).to.have.property('error');
        chai_1.expect(out.body).to.deep.equal({ error: 'Message not provided' });
    });
    it("Should be able to echo", function () {
        var server = http.createServer();
        server.on('request', function (request, response) {
            var out = Server_1.default.echo(request, response, null);
            Util_1.default.test(JSON.stringify(out));
            sanityCheck(out);
            chai_1.expect(out.code).to.equal(400);
            chai_1.expect(out.body).to.have.property('error');
        });
    });
    it("Should be able to local echo", function () {
        var server = http.createServer();
        var local = new Server_1.default(1002);
        local.start().then(function (status) {
            server.on('request', function (request, response) {
                var out = Server_1.default.echo(request, response, null);
                Util_1.default.test(JSON.stringify(out));
                sanityCheck(out);
                chai_1.expect(out.code).to.equal(400);
                chai_1.expect(out.body).to.have.property('error');
            });
        }).catch(function () {
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=EchoSpec.js.map