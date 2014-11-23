var mllp=require('./index.js');

var server = new mllp.MLLPServer();

server.on('hl7', function(data){
	console.log("just an example", data);
});