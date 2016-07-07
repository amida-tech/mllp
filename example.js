var mllp = require('./index.js');

var server = new mllp.MLLPServer('127.0.0.1', 1234);

// Subscribe to inbound messages
server.on('hl7', function (data){
    console.log('received payload:', data);
});

// Send outbound messages
server.send('127.0.0.1', 4321, 'outbound-hl7-message', function (err, ackData) {
    // async callback code here
});
