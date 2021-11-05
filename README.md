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

```
# you need Node.js installed

# install dependencies and test
yarn
yarn test
```

## Usage

See `example.js`:

```ts
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
```

## Contributing

Contributors are welcome. See issues on [GitHub issues](https://github.com/amida-tech/mllp/issues)

## Release Notes

See release notes [here] (./RELEASENOTES.md)

## License

Licensed under [Apache 2.0](./LICENSE)
