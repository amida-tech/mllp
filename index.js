var net = require('net');
var hl7 = require('hl7');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

//The header is a vertical tab character <VT> its hex value is 0x0b.
//The trailer is a field separator character <FS> (hex 0x1c) immediately followed by a carriage return <CR> (hex 0x0d)

var VT = String.fromCharCode(0x0b);
var FS = String.fromCharCode(0x1c);
var CR = String.fromCharCode(0x0d);

function MLLPServer(host, port, logger) {

    var self = this;

    var HOST = host || '127.0.0.1';
    var PORT = port || 6969;
    logger = logger || console.log;

    var Server = net.createServer(function (sock) {

        logger('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

        function ackn(data, ack_type) {

            //get message ID
            var msg_id = data[0][10];

            var header = [data[0]];

            //switch around sender/receiver names
            header[0][3] = data[0][5];
            header[0][4] = data[0][6];
            header[0][5] = data[0][3];
            header[0][6] = data[0][4];

            var result = hl7.serializeJSON(header);
            result = result + "\r" + "MSA|" + ack_type + "|" + msg_id;

            return result;
        }

        sock.on('data', function (data) {
            data = data.toString();
            //strip separators
            data = data.substring(1, data.length - 2);
            var data2 = hl7.parseString(data);

            self.emit('hl7', data);

            var ack = ackn(data2, "AA");

            logger("DATA:\nfrom " + sock.remoteAddress + ':\n' + data.split("\r").join("\n"));
            logger();

            sock.write(VT + ack + FS + CR);
            logger("ACK:\n" + ack.split("\r").join("\n"));
            logger();
        });

        sock.on('close', function (data) {
            logger('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        });

    });

    self.send = function (receivingHost, receivingPort, hl7Data, callback) {
        var sendingClient = new net.connect({
            host: receivingHost,
            port: receivingPort
        }, function () {
            logger('Sending data to ' + receivingHost + ':' + receivingPort);
            sendingClient.write(VT + hl7Data + FS + CR);
        });

        sendingClient.on('data', function (rawAckData) {
            logger(receivingHost + ':' + receivingPort + ' ACKED data');

            var ackData = rawAckData
                .toString() // Buffer -> String
                .replace(VT, '')
                .split('\r')[1] // Ack data
                .replace(FS, '')
                .replace(CR, '');

            callback(null, ackData);
            _terminate();
        });

        sendingClient.on('error', function (error) {
            logger(receivingHost + ':' + receivingPort + ' couldn\'t process data');

            callback(error, null);
            _terminate();
        });

        var _terminate = function () {
            logger('closing connection with ' + receivingHost + ':' + receivingPort);
            sendingClient.end();
        };
    };

    Server.listen(PORT, HOST);
}

util.inherits(MLLPServer, EventEmitter);

exports.MLLPServer = MLLPServer;
