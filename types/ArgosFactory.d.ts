import { Database } from "./Database";
import { Watcher } from "./Watcher";
import { DatabaseConstructor, WatcherConstructor } from "./index";

export const enum DatabaseEnum {
    Neo4J = 0
}

export const enum WatcherEnum {
    EthereumWatcher = 0
}

export declare class DatabaseFactory {
    
    /**
     * Create a database instance
     * @param {DatabaseConstructor} args the arguments corresponding to the class
     * @returns {Database} a database instance or nothing
     */
    static createDbInstance(args: DatabaseConstructor): Database;
}

export declare class WatcherFactory {
    /**
     * Create a database instance
     * @param {WatcherConstructor} args the arguments corresponding to the class
     * @returns {Watcher} a database instance or nothing
     */
    static createWatcherInstance(args: WatcherConstructor): Watcher;
}

