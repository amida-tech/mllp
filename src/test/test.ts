import { MllpServer } from '../mllp'
import { assert } from 'chai'
import * as net from 'net'

var fs = require('fs')

describe('MllpServer initialized with port and host', function () {
    this.timeout(40000);

    let hl7: string = '';
    let server: MllpServer;

    before((done) => {
        hl7 = fs.readFileSync('./src/test/fixtures/test.txt').toString().split('\n').join('\r')

        server = new MllpServer('127.0.0.1', 1234)
        server.listen()
        done()
    });

    after((done)=>{
        server.close(done)
    })


    describe('should send and recieve HL7 messages', function () {
        let error: any;
        let data: any;

        // Sending
        beforeEach((done) => {
            server.send('127.0.0.1', 1234, hl7, (err: any, ackData: any) => {
                error = err;
                data = ackData;
                done();
            });
        });

        // Receiving
        it('receives an HL7 ACK message without error', () => {
            assert.equal(error, null);
            assert.equal(data, 'MSA|AA|Q335939501T337311002');
        });

        it('receives an HL7 message', () => {
            server.on('hl7', function (data) {
                assert.equal(hl7, data);
            });
        });
    });

    describe('should handle HL7 message that errors', function () {
        var error: any;
        var data: any;

        // Sending
        beforeEach((done) => {
            // port 9999 is bogus
            server.send('127.0.0.1', 9999, hl7, (err: any, ackData: any) => {
                error = err;
                data = ackData;
                done();
            });
        });

        // Receiving
        it('receives an error response', () => {
            assert.isNotNull(error);
            assert.equal(data, null);
        });
    });

    describe('should handle empty payload', function () {
        var error: any;
        var data: any;
        let server2: MllpServer;

        // Sending
        beforeEach((done) => {
            server2 = new MllpServer('127.0.0.1', 1236)
            server2.listen()
            
            server2.send('127.0.0.1', 1236, '', (err: any, ackData: any) => {
                error = err;
                data = ackData;
                done();
            });
        });

        // Receiving
        it('receives an AE message', () => {
            assert.isNull(error);
            assert.equal(data, "MSA|AE|");
        });
        
        after((done)=>{
            server2.close(done)
        })
    });

    describe("should send a large A08 Message and recieve an ACK back", () => {
        let largeHl7 = fs.readFileSync('./src/test/fixtures/LargeA08.txt').toString().split('\n').join('\r')
        let server2: MllpServer

        var ack, error;

        beforeEach((done) => {
            server2 = new MllpServer('127.0.0.1', 1235)
            server2.listen()

            server.send("127.0.0.1", 1235, largeHl7, (err: any, ackData: any) => {
                error = err;
                ack = ackData;
                done();
            });
        });

        it("receives a HL7 Message", () => {
            server2.on('hl7', function (data) {
                assert.equal(largeHl7, data);
            });            
        });

        after((done)=>{
            server2.close(done)
        })
    
    });
});

describe('MllpServer without specific host and port', () => {
    let newServer: MllpServer

    it('should use sane defaults', (done) => {
        newServer = new MllpServer()
        newServer.listen()
        
        let client =  net.createConnection({
            // defaults that the library uses
            host: '127.0.0.1',
            port: 6969
        }, function () {
            client.end()
        });

        client.end(done)
    });

    after((done)=>{
        newServer.close(done)
    })
});