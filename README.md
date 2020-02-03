Forked from https://github.com/amida-tech/mllp because it needed to get issues fixed, namely:

* Create a clone of the input data array prior to swapping elements

mllp
====

[![NPM](https://nodei.co/npm/mllp-node.png)](https://nodei.co/npm/mllp-node/)

[![Build Status](https://travis-ci.org/amida-tech/mllp.svg)](https://travis-ci.org/amida-tech/mllp)
[![Coverage Status](https://coveralls.io/repos/amida-tech/mllp/badge.png)](https://coveralls.io/r/amida-tech/mllp)

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

var server = new mllp.MLLPServer('127.0.0.1', 1234);

// Subscribe to inbound messages
server.on('hl7', function (data){
    console.log('received payload:', data);
});

// Send outbound messages
server.send('127.0.0.1', 4321, 'outbound-hl7-message', function (err, ackData) {
    // async callback code here
});
```

## Contributing

Contributors are welcome. See issues on [GitHub issues](https://github.com/amida-tech/mllp/issues)

## Release Notes

See release notes [here] (./RELEASENOTES.md)

## License

Licensed under [Apache 2.0](./LICENSE)
