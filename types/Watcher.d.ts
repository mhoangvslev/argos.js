import { argos } from "./index";
import { Database } from "./Database";

export declare abstract class Watcher {
    provider: argos.ProviderType
    dbService: Database
    contract: argos.ContractType

    /**
     * Create a watcher for any network
     */
    constructor();

    /**
     * Get events from log 
     * @param {string} eventName the event name to watch
     * @param {string | number} fromBlock the start block, default is 0
     * @param {string} toBlock  the ending block, default is 'lastest'
     * @returns {Promise<any[]>}
     */
    public abstract getEvents(eventName: string, fromBlock: string | number, toBlock: string): Promise<any[]>;

    /**
     * Watch eve
     * @param {string} eventName 
     * @returns {Promise<void>}
     */
    public abstract watchEvents(eventName: string): Promise<void>;
}