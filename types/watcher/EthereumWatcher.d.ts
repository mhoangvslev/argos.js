import { ethers } from "ethers";
import { Watcher } from "./Watcher";
import { Database } from "../database/Database";
import { DatabaseEnum, DatabaseConstructor } from "..";

export const enum ProviderEnum {
    defaultProvider = 0,
    EtherscanProvider = 1,
    InfuraProvider = 2,
    JsonRpcProvider = 3,
    Web3Provider = 4,
    IpcProvider = 5
}

export declare class EthereumWatcher extends Watcher {
    _provider: ethers.providers.Provider;
    _dbService: Database;
    _contract: ethers.Contract;

    /**
     * Create a watcher for Ethereum blockchain
     * @param {string} contractAddr the address of the verified contract
     * @param {string} abi the ABI of the verified contract
     * @param {number} providerType the Etherscan API Token
     * @param { DatabaseConstructor } dbType the database servcice constructor
     * @param {object} providerConfig the loaded config file
     * @param {boolean} clearDB retrieve from genesis block instead of the latest in DB (db cleared)
     * @param {string} exportDir export dir
     * @returns {EthereumWatcher} Ethereum instance
     */
    constructor(contractAddr: string, abi: string, providerType: number, dbType: DatabaseConstructor, providerConfig: object, clearDB: boolean, exportDir: string);

    /**
     * Refresh the database connection
     */
    private interactDB();

    /**
     * Watch event with particular model
     * @param {string} eventName name of the event, usually 'Transfer'
     * @param {Neode.SchemaObject} dbModel the model loaded via require()
     * @param {number} fromDate timestamp
     * @param {number} toDate timestamp
     */
    public watchEvents(eventName: string, fromDate: number, toDate: number): Promise<void>;

    /**
     * Get basic information about the contract
     * @returns {Map} the object containing information
     */
    private getInfos(): object;

    /**
     * Export to CSV
     */
    public exportCSV(): void;

    /**
     * Import from CSV
     */
    public importCSV(): void;
}