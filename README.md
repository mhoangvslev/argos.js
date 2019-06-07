# argos.js

[![NPM Version][npm-image]][npm-url]

With the smart-contracts, we are able to make exchanges with complex arbitrary rules. By looking at the interaction data, we hope to extract meaningful/valuable information that provide great assistance in decision-making process.

## What is it?
- A **platform** that provides the ability to watch any smart-contract events, on any blockchain
- **Only 3 modules**: Watcher, Database, Visualiser
- **Community-orientated**: you can add support for your favourtite tools just by extending 3 base classes in each module 

### Watcher
This module allows you to extract data from smart-contract events. You only need to tell it:
- The address of the contract
- The blockrange (by blocknumber or by date)
- The data type you want to extract (you must be able to read smart-contract code)

### Database
This module connects to your Graph DB and execute queries. 

### Visualiser
This module executes MATCH queries to your Graph DB and display results.

## Install

```bash
npm install argosjs
```

or 

```bash
npm install https://github.com/zgorizzo69/EthGraphQL
```

The package comes with customised `neovis.js` that can be found under `vendor`. You have to build it first:

```bash
cd vendor/neovis.js
npm run build

# Success, go back to project root
cd ../../
npm install vendor/neovis.js
```

## If you use Neo4J as GraphDB

You should also configure your Neo4J database. In neo4j.conf, add:
```
# APOC
apoc.export.file.enabled=true
apoc.import.file.enabled=true
apoc.import.file.use_neo4j_config=false
```

## Usage

> Create an object of type DatabaseConstructor (here Neo4JConstructor).

```javascript
dbConstructor: Neo4JConstructor = {
    username: config.database.neo4j.username,
    password: config.database.neo4j.password,
    bolt: config.database.neo4j.bolt,
    enterpriseMode: config.database.neo4j.enterpriseMode,
    driverConf: config.database.neo4j.driverConf,
    model: require('../models/Account.js')
  }
```

> Create an Watcher instance (here EthereumWatcher)

```javascript
this._contractService = WatcherFactory.createWatcherInstance({
      type: WatcherEnum.EthereumWatcher,
      provider: ProviderEnum.InfuraProvider,
      clearDB: clearDB,
      address: addr,
      abi: abi,
      db: this.dbConstructor,
      providerConf: config.providers,
      exportDir: config.contract.export
    });

this._contractService.watchEvents("Transfer", fromDate, toDate);
```

> Create an Visualiser instance (here NeoVis)

```javascript
this._visualiser = new NeoVis(this.dbConstructor, "viz", config.datavis.neovis);

// Run community-detection algorithm (procedure) on DB
this._visualiser.detectCommunity(this.communityDetectionAlgorithm, { label: 'Account', relationship: 'TRANSFER', writeProperty: "community" });

// Run centrality algorithm (procedure);
this._visualiser.centrality(this.centralityAlgorithm, { label: 'Account', relationship: 'TRANSFER', writeProperty: "size" });

// Run pathfinding algorithm on DB
this._visualiser.pathfinding({ algo: PathFindingAlgorithmEnum.ShortestPath, param: {} });

// Display all nodes with LIMIT of 700 objects
this._visualiser.displayWithCypher({ query: "MATCH (n:Account)-[r:TRANSFER]->(m:Account) RETURN n,r,m" }, 700);
```

## Example

- 

## License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://img.shields.io/npm/v/argosjs.svg
[npm-url]: https://www.npmjs.com/package/argosjs
[travis-image]: https://img.shields.io/travis/live-js/live-xxx/master.svg
[travis-url]: https://travis-ci.org/live-js/live-xxx

