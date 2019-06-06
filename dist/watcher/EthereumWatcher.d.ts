import { ethers } from "ethers";
import { BlockTag } from "ethers/providers";
import { Networkish } from "ethers/utils";
import { DatabaseConstructorType, Neo4JConstructor } from "..";
import { Database } from "../database/Database";
import { EventInfoDataStruct, Watcher } from "./Watcher";
export interface ProviderConfig {
    timeout?: number;
    infura?: {
        network?: Networkish;
        projectId?: string;
    };
    etherscan?: {
        network?: Networkish;
        api?: string;
    };
    jsonrpc?: {
        network: Networkish;
        url?: string;
        username?: string;
        password?: string;
        allowInsecure?: boolean;
    };
    web3?: {
        host?: string;
    };
    ipc?: {
        path?: string;
        network?: Networkish;
    };
}
export default class EthereumWatcher extends Watcher {
    _contractAddr: string;
    _dbService: Database;
    _clearDB: boolean;
    _config: ProviderConfig;
    _provider: ethers.providers.BaseProvider;
    _contract: ethers.Contract;
    _exportDir: string;
    _infos: Map<any, any>;
    _event: any;
    _timeout: any;
    _dbType: Neo4JConstructor;
    /**
     * Create a watcher for Ethereum blockchain
     * @param {string} contractAddr the address of the verified contract
     * @param {string} abi the ABI of the verified contract
     * @param {number} providerType the Etherscan API Token
     * @param {DatabaseConstructorType} dbType the database servcice constructor
     * @param {ProviderConfig} providerConfig the loaded config file
     * @param {boolean} clearDB retrieve from genesis block instead of the latest in DB (db cleared)
     * @param {string} exportDir export dir
     * @returns {EthereumWatcher} Ethereum instance
     */
    constructor(contractAddr: string, abi: string, providerType: number, dbType: DatabaseConstructorType, providerConfig: ProviderConfig, clearDB: boolean, exportDir: string);
    /**
     * Watch event with particular model
     * @param {string} eventName name of the event, usually 'Transfer'
     * @param {Neode.SchemaObject} dbModel the model loaded via require()
     * @param {number} fromDate timestamp
     * @param {number} toDate timestamp
     */
    watchEvents(eventName: string, fromDate?: Date, toDate?: Date): Promise<void>;
    /**
     * Convert timestimp to blocknumber
     * @param {Date} date
     */
    timeToBlock(date: Date): Promise<number>;
    /**
     * Export to CSV
     */
    exportCSV(): Promise<any>;
    /**
     * Import from CSV
     */
    importCSV(): Promise<any>;
    /**
     * Get basic information about the contract
     * @returns {Map} the object containing information
     */
    getInfos(): Promise<Map<string, any>>;
    /**
     * Assemble a selection of data out of a log part
     * @param {ethers.providers.Log[]} logPart the extracted log part
     * @returns { EventInfoDataStruct } the required information to build a db node
     */
    getLogData(logPart: ethers.providers.Log[]): Promise<EventInfoDataStruct[]>;
    /**
     * Get events from provider and store data to database
     * @param {string} eventName
     * @param {number} fromBlock
     * @param {number} toBlock
     */
    getEvents(eventName: string, fromBlock: BlockTag, toBlock: BlockTag): Promise<void>;
    private initOnce;
    /**
     * Refresh the database connection, do an action then close connection
     * @param {function} callback the action to perform once the connection is interupted
     */
    private refreshDB;
    /**
     * Get events from log
     * @param {string} eventName the event name to watch
     * @param {number} fromBlock the start block, default is 0
     * @param {number} toBlock  the ending block, default is 'lastest'
     * @returns {Promise<{logs: ethers.providers.Log[]; steps: number;}>} the graph data and the number of steps required to process the log
     */
    private _getEvents;
    /**
     * Extract data from log entry
     * @param {ethers.providers.Log} logEntry a log entry
     * @returns {EventInfoDataStruct} the required information to build a db node
     */
    private extractData;
    /**
     * Get the smaller batch of events
     * @param {string} eventName
     * @param {number} fromBlock
     * @param {number} toBlock
     * @returns {Promise<ethers.providers.Log[]>}
     */
    private getEventPatch;
}
export { EthereumWatcher };
