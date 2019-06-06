import { BlockTag } from "ethers/providers";
import { DateTime } from "neo4j-driver/types/v1";
import { ContractType, ProviderType } from "..";
import { Database } from "../database/Database";
export declare interface EventInfoDataStruct {
    blockNumber: number;
    date: DateTime<number>;
    from: string;
    to: string;
    value: string;
}
export default abstract class Watcher {
    provider: ProviderType;
    dbService: Database;
    contract: ContractType;
    /**
     * Create a watcher for any network
     */
    constructor();
    /**
     * Get events from log
     * @param {string} eventName the event name to watch
     * @param {BlockTag} fromBlock the start block, default is 0
     * @param {BlockTag} toBlock  the ending block, default is 'lastest'
     * @param {number} nbTasks how many batches required to process the log
     */
    abstract getEvents(eventName: string, fromBlock: BlockTag, toBlock: BlockTag): Promise<void>;
    /**
     * Watch event with particular model
     * @param {string} eventName name of the event, usually 'Transfer'
     * @param {Neode.SchemaObject} dbModel the model loaded via require()
     * @param {Date} fromDate timestamp
     * @param {Date} toDate timestamp
     */
    abstract watchEvents(eventName: string, fromDate: Date, toDate: Date): Promise<void>;
    /**
     * Convert timestimp to blocknumber
     * @param {Date} date
     */
    abstract timeToBlock(date: Date): Promise<number>;
    /**
     * Export to CSV
     */
    abstract exportCSV(): void;
    /**
     * Import from CSV
     */
    abstract importCSV(): void;
}
export { Watcher };
