import { argos } from "../..";
import { Database } from "../database/Database";

export declare class Watcher {
    provider: argos.ProviderType
    dbService: Database
    contract: argos.ContractType

    /**
     * Create a watcher for Ethereum network
     * @param {string} contractAddr the address of the verified contract
     * @param {string} abi the ABI of the verified contract
     * @param {string} apiToken the Etherscan API Token
     * @returns {Watcher}
     */
    constructor(contractAddr: string, abi: string, apiToken: string, dbService: Database);

    /**
     * Get events from log 
     * @param {string} eventName the event name to watch
     * @param {string} fromBlock the start block, default is 0
     * @param {string} toBlock  the ending block, default is 'lastest'
     * @returns {Promise<any[]>}
     */
    getEvents(eventName: string, fromBlock: string, toBlock: string): Promise<any[]>;

    /**
     * Watch eve
     * @param {string} eventName 
     * @returns {Promise<void>}
     */
    watchEvents(eventName: string): Promise<void>;
}