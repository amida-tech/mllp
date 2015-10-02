mllp
====

HL7's MLLP (Minimum Lower Layer Protocol) server implementation in Node.js.


Listen on predefined port for HL7 messages in format:

```
<VT>[HL7 Message]<FS><CR>
```

* [HL7 MLP minimul layer protocol defined](http://www.hl7standards.com/blog/2007/05/02/hl7-mlp-minimum-layer-protocol-defined/)
* [ACK message](http://www.hl7standards.com/blog/2007/02/01/ack-message-original-mode-acknowledgement/)


## Quick up and running guide

### Prerequisites

- Node.js (v0.10+) and NPM
- Grunt.js

```
# you need Node.js and Grunt.js installed

# install dependencies and build
npm install
grunt
```

## Usage

See `example.js`:

```javascript
var mllp = require('mllp-node');

var server = new mllp.MLLPServer('127.0.0.1',6969);

server.on('hl7', function(data){
	console.log("just an example", data);
});
```


## Contributing

Contributors are welcome. See issues on [GitHub issues](https://github.com/amida-tech/mllp/issues)

## Release Notes

See release notes [here] (./RELEASENOTES.md)

## License

Licensed under [Apache 2.0](./LICENSE)
