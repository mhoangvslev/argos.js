# argos.js

> An API that provides the ability to watch any smart-contract events, on any blockchain

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]

## Context

With the smart-contracts, we are able to make exchanges with complex arbitrary rules. By looking at the log entries data, we hope to extract meaningful/valuable information that provide great assistance in decision-making process.

## Install

```bash
npm install argosjs
```

You should also configurate your Neo4J database. In neo4j.conf, add:
```
# APOC
apoc.export.file.enabled=true
apoc.import.file.enabled=true
apoc.import.file.use_neo4j_config=false
```

## Usage

> You only need 2 elements: Database, Watcher. See the exemple [here]().

```javascript
const dbConstructor = {
    type: DatabaseEnum.Neo4J,
    config: config.database.neo4j,
    model: require('../models/Account.js')
}

this._contractService = WatcherFactory.createWatcherInstance({
    type: WatcherEnum.EthereumWatcher,
    provider: ProviderEnum.InfuraProvider,
    clearDB: clearDB,
    address: addr,
    abi: abi,
    db: dbConstructor,
    providerConf: config.providers
});
this._contractService.watchEvents("Transfer", "transfer");
```

## TO DO

- 

## License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://img.shields.io/npm/v/argosjs.svg
[npm-url]: https://www.npmjs.com/package/argosjs
[travis-image]: https://img.shields.io/travis/live-js/live-xxx/master.svg
[travis-url]: https://travis-ci.org/live-js/live-xxx

