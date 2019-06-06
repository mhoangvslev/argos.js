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
    public provider: ProviderType;
    public dbService: Database;
    public contract: ContractType;

    /**
     * Create a watcher for any network
     */
    constructor() {
        console.log("Watcher instance initialised!");
    }

    /**
     * Get events from log
     * @param {string} eventName the event name to watch
     * @param {BlockTag} fromBlock the start block, default is 0
     * @param {BlockTag} toBlock  the ending block, default is 'lastest'
     * @param {number} nbTasks how many batches required to process the log
     */
    public abstract getEvents(eventName: string, fromBlock: BlockTag, toBlock: BlockTag): Promise<void>;

    /**
     * Watch event with particular model
     * @param {string} eventName name of the event, usually 'Transfer'
     * @param {Neode.SchemaObject} dbModel the model loaded via require()
     * @param {Date} fromDate timestamp
     * @param {Date} toDate timestamp
     */
    public abstract watchEvents(eventName: string, fromDate: Date, toDate: Date): Promise<void>;

    /**
     * Convert timestimp to blocknumber
     * @param {Date} date
     */
    public abstract timeToBlock(date: Date): Promise<number>;

    /**
     * Export to CSV
     */
    public abstract exportCSV(): void;

    /**
     * Import from CSV
     */
    public abstract importCSV(): void;
}

export { Watcher };
