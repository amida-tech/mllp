import * as net from 'net'
import { TypedEmitter } from 'tiny-typed-emitter';

const hl7: any = require('hl7')

/**
 * @constructor MllpServer
 * @param {string} host a resolvable hostname or IP Address
 * @param {integer} port a valid free port for the server to listen on.
 * @param {object} logger
 * 
 * @fires MLLPServer#hl7  
 * 
 * @example
 * var server = new MllpServer('hl7server.mydomain', 3333, console.log);
 * 
 * server.on('hl7', function(message) {
 *  console.log("Message: " + message);
 *  // INSERT Unmarshalling or Processing here
 * });
 * 
 * @example
 * <caption>An ACK is sent back to the server</caption>
 *  MSH|^~\&|SOMELAB|SOMELAB|SOMELAB|SOMELAB|20080511103530||ORU^R01|Q335939501T337311002|P|2.3|||
 *  MSA|AA|Q335939501T337311002
 * 
 */

interface MllpEvents {
    'hl7': (message: string) => void
}

export class MllpServer extends TypedEmitter<MllpEvents> {
    port: number
    host: string
    logger: any
    server: net.Server

    static readonly VT = String.fromCharCode(0x0b);
    static readonly FS = String.fromCharCode(0x1c);
    static readonly CR = String.fromCharCode(0x0d);

    constructor(host?: string, port?: number, logger?: any) {
        super();

        this.host = host || '127.0.0.1'
        this.port = port || 6969
        this.logger = logger || console;

        this.server = net.createServer(this.serverListener.bind(this))

    }

    private serverListener(sock: net.Socket) {
        this.logger.info('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

        sock.on('data', (data: any) => {
            let { msg, ack } = this.handleData(data.toString())

            /**
             * MLLP HL7 Event. Fired when a HL7 Message is received.
             * @event MllpServer#hl7
             * @type {string}
             * @property {string} message string containing the HL7 Message (see example below)
             * @example MSH|^~\&|XXXX|C|SOMELAB|SOMELAB|20080511103530||ORU^R01|Q335939501T337311002|P|2.3|||
             */
            this.emit('hl7', msg);

            sock.write(MllpServer.VT + this.ackn(ack, "AA") + MllpServer.FS + MllpServer.CR);
        })
        sock.on('close', (data) => {
            this.logger.info('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        });

    }

    private ackn(data: any, ack_type: string): string {
        var result;

        try {
            //get message ID
            var msg_id = data[0][10];

            var header = [data[0]];

            //switch around sender/receiver names
            header[0][3] = data[0][5];
            header[0][4] = data[0][6];
            header[0][5] = data[0][3];
            header[0][6] = data[0][4];

            result = hl7.serializeJSON(header);
            result = result + "\r" + "MSA|" + ack_type + "|" + msg_id;
        } catch (error) {
            this.logger.error("Could not generate ACK - sending AE type.");
            result = "\r" + "MSA|AE|";
        }

        return result;
    }

    private handleData(msg: string) {
        let message: string = ''
        let ackData: any

        //strip separators
        if (msg.indexOf(MllpServer.VT) > -1) {
            message = '';
        }

        message += msg.replace(MllpServer.VT, '');

        if (msg.indexOf(MllpServer.FS + MllpServer.CR) > -1) {
            message = message.replace(MllpServer.FS + MllpServer.CR, '');
            ackData = hl7.parseString(message);
            this.logger.info("Message:\r\n" + message + "\r\n\r\n");
        }

        return { msg: message, ack: ackData };
    }

    send(receivingHost: string, receivingPort: number, hl7Data: any, callback: Function) {
        const sendingClient = net.createConnection({
            host: receivingHost,
            port: receivingPort
        }, () => {
            this.logger.info('Sending data to ' + receivingHost + ':' + receivingPort);
            sendingClient.write(MllpServer.VT + hl7Data + MllpServer.FS + MllpServer.CR);
        });

        let _terminate = () => {
            this.logger.info('closing connection with ' + receivingHost + ':' + receivingPort);
            sendingClient.end();
        };
        sendingClient.on('data', (rawAckData) => {
            this.logger.info(receivingHost + ':' + receivingPort + ' ACKED data');

            var ackData = rawAckData
                .toString() // Buffer -> String
                .replace(MllpServer.VT, '')
                .split('\r')[1] // Ack data
                .replace(MllpServer.FS, '')
                .replace(MllpServer.CR, '');

            callback(null, ackData);
            _terminate();
        });
        sendingClient.on('error', (error) => {
            this.logger.info(receivingHost + ':' + receivingPort + ' couldn\'t process data');

            callback(error, null);
            _terminate();
        });
    }

    listen(callback?: Function) {
        if (callback)
            this.server.listen(this.port, this.host, () => { callback() })
        else
            this.server.listen(this.port, this.host)
    }

    close(callback: Function) {
        this.server.close(() => {
            callback()
        })
    }
}
