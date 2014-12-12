var expect = require('chai').expect;
var assert = require('chai').assert;

var fs = require("fs");
var mllp = require('../index.js');
var net = require('net');

describe('test server with client data exchange', function () {
    var hl7 = "";

    before(function () {
        hl7 = fs.readFileSync('./test/fixtures/test.txt').toString().split("\n").join("\r");

        var server = new mllp.MLLPServer();

        server.on('hl7', function (data) {
            console.log("data received: ", data);
        });

    });

    it('send and receive', function () {

        var client = net.connect({
                port: 6969
            },
            function () { //'connect' listener
                console.log('client connected');
                client.write('@' + hl7 + '@@');
            });

        client.on('data', function (data) {
            var blah = data.toString();

            console.log("ack received: ", blah.substring(1, blah.length - 3).split("\r").join("\n"));
            blah = blah.split("\r");
            assert.equal(blah[1].substring(0, 7), 'MSA|AA|');

            client.end();

        });

    });

});
