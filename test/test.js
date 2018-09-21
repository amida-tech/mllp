var assert = require('chai').assert;
var fs = require('fs');
var mllp = require('../index.js');
var net = require('net');

var VT = String.fromCharCode(0x0b);
var FS = String.fromCharCode(0x1c);
var CR = String.fromCharCode(0x0d);

describe('test server with client data exchange', function () {
    var hl7 = '';
    var server;

    before(function () {
        hl7 = fs.readFileSync('./test/fixtures/test.txt').toString().split('\n').join('\r');

        server = new mllp.MLLPServer('127.0.0.1', 1234);
    });

    describe('sending and receiving HL7 messages', function () {
        var error;
        var data;

        // Sending
        beforeEach(function (done) {
            server.send('127.0.0.1', 1234, hl7, function (err, ackData) {
                error = err;
                data = ackData;
                done();
            });
        });

        // Receiving
        it('receives an HL7 ACK message without error', function () {
            assert.equal(error, null);
            assert.equal(data, 'MSA|AA|Q335939501T337311002');
        });

        it('receives an HL7 message', function () {
            server.on('hl7', function (data) {
                assert.equal(hl7, data);
            });
        });
    });

    describe('sending HL7 message that errors', function () {
        var error;
        var data;

        // Sending
        beforeEach(function (done) {
            // port 9999 is bogus
            server.send('127.0.0.1', 9999, hl7, function (err, ackData) {
                error = err;
                data = ackData;
                done();
            });
        });

        // Receiving
        it('receives an error response', function () {
            assert.isNotNull(error);
            assert.equal(data, null);
        });
    });

    describe('not passing in specific host and port', function () {
        beforeEach(function () {
            server = new mllp.MLLPServer();
        });

        it('uses sane defaults', function (done) {
            new net.connect({
                // defaults that the library uses
                host: '127.0.0.1',
                port: 6969
            }, function () {
                // no need for assertion... this is the success callback
                // if it doesn't get invoked, the test will not pass.
                done();
            });
        });
    });
});

describe("sends a large message for data exchange", function () {
    var hl7Message = '';

    before(function () {
        hl7Message = fs.readFileSync('./test/fixtures/largeA08.txt').toString().split('\n').join('\r');

        server = new mllp.MLLPServer('127.0.0.1', 1235);
    });

    describe("sending a large A08 Message and Receiving an Ack Back", function () {
        var ack, error;

        beforeEach(function (done) {
            server.send("127.0.0.1", 1234, hl7Message, function (err, ackData) {
                error = err;
                ack = ackData;
                done();
            });
        });

        it("receives a HL7 Message", function () {
            server.on('hl7', function (data) {
                assert.equal(hl7Message, data);
            });
        });
    });
});
