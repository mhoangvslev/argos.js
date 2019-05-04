import { ethers } from "ethers";
import { Watcher } from "./Watcher";
import { Database } from "./Database";

export declare class EthereumWatcher extends Watcher {
    provider: ethers.providers.Provider;
    dbService: Database;
    contract: ethers.Contract;

    /**
     * Create a watcher for Ethereum network
     * @param {Argos} argos the argosjs instance
     * @param {string} contractAddr the address of the verified contract
     * @param {string} abi the ABI of the verified contract
     * @param {string} apiToken the Etherscan API Token
     * @param {Database} dbService the database servcice
     */
    constructor(contractAddr: string, abi: string, apiToken: string, dbService: Database);

    /**
     * Get events from log 
     * @param {string} eventName the event name to watch
     * @param {string | number} fromBlock the start block, default is 0
     * @param {string | number} toBlock  the ending block, default is 'lastest'
     * @returns {Promise<any[]>}
     */
    public getEvents(eventName: string, fromBlock: string | number, toBlock: string | number): Promise<any[]>;

    /**
     * Watch eve
     * @param {string} eventName 
     * @returns {Promise<void>}
     */
    public watchEvents(eventName: string): Promise<void>;
}