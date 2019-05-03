# argos.js
> An API that provides the ability to watch any smart-contract events

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]

## Install

```bash
npm install argosjs
```

## Usage

> You only need 2 elements: Database, Watcher. See the exemple [here]().

```javascript
this._dbService = new Neo4J(config.neo4j.bolt, config.neo4j.username, config.neo4j.password);
this._dbService.dbCreateModel(require('./database/models/Account.js'));

this._contractService = new EthereumWatcher(addr, abi, config.etherscan.api, this._dbService);
const panoptes = new Argos(this._contractService);

panoptes.initArgos();
```

## License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://img.shields.io/npm/v/argosjs.svg
[npm-url]: https://www.npmjs.com/package/argosjs
[travis-image]: https://img.shields.io/travis/live-js/live-xxx/master.svg
[travis-url]: https://travis-ci.org/live-js/live-xxx

