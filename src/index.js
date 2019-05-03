import {Neo4J} from './database/Neo4J';
import {Database} from './database/Database';
import {EthereumWatcher} from './watcher/EthereumWatcher';
import {Watcher} from "./watcher/Watcher";

export default class Argos {

    /**
     * Create argos object
     * @param {Watcher} watcher the watcher instance
     */
    constructor(watcher){
        this.watcher = watcher;
    }

    /**
     * Start collecting events and persists data to the database
     */
    initArgos() {
        this.watcher.watchEvents('Transfer');
    }
}

export { Argos, Watcher, Database, Neo4J, EthereumWatcher };