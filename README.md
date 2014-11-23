=Minimal Lower-Layer Protocol (MLLP)=

```
<VT>[HL7 Message]<FS><CR>
```

* http://www.hl7standards.com/blog/2007/05/02/hl7-mlp-minimum-layer-protocol-defined/
* http://www.hl7standards.com/blog/2007/02/01/ack-message-original-mode-acknowledgement/
    

== Usage ==

see example.js

```javascript
var mllp=require('./index.js');

var server = new mllp.MLLPServer();

server.on('hl7', function(data){
	console.log("just an example", data);
});
```