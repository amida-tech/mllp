import { MllpServer } from "./mllp";

const server: MllpServer = new MllpServer('127.0.0.1', 1234);

server.listen()

// Subscribe to inbound messages
server.on('hl7', (data) => {
    console.log('received payload:', data);
});

// Send outbound messages
server.send('127.0.0.1', 4321, 'outbound-hl7-message', (err: any, ackData: any) => {
    // async callback code here
    console.log(`Sent message!\nerr: ${err}\nackData: ${ackData}`)
});
