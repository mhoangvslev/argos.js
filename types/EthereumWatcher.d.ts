import { ethers } from "ethers";
import { Watcher } from "./Watcher";
import { Database } from "./Database";

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
     * @param { Database } dbService the database servcice
     * @param {object} config the loaded config file
     * @returns {EthereumWatcher} Ethereum instance
     */
    constructor(contractAddr: string, abi: string, providerType: number, dbService: Database, config: object);

    /**
     * Get events from log 
     * @param {string} eventName the event name to watch
     * @param {string | number} fromBlock the start block, default is 0
     * @param {string | number} toBlock  the ending block, default is 'lastest'
     * @returns {Promise<any[]>}
     */
    public getEvents(eventName: string, fromBlock: string | number, toBlock: string | number): Promise<any[]>;

    /**
     * Watch event with particular model
     * @param {string} eventName name of the event, usually 'Transfer'
     * @param {string} usingRel name of the relationship that we use in DB
     * @param { Neode.SchemaObject } dbModel the model loaded via require()
     */
    public watchEvents(eventName: string, usingRel: string): Promise<void>;
}