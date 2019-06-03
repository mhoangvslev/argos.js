import { argos } from "../index";
import { Database } from "../database/Database";

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
     * @param {string | number} toBlock  the ending block, default is 'lastest'
     * @param {number} nbTasks how many batches required to process the log
     */
    public getEvents(eventName: string, fromBlock: string | number, toBlock: string | number): Promise<any[]>;

    /**
     * Watch event with particular model
     * @param {string} eventName name of the event, usually 'Transfer'
     * @param {Neode.SchemaObject} dbModel the model loaded via require()
     * @param {number} fromDate timestamp
     * @param {number} toDate timestamp
     */
    public watchEvents(eventName: string, fromDate: number, toDate: number): Promise<void>;
}