import { ethers } from "ethers";
import { BlockTag } from "ethers/providers";
import { ContractType, ProviderType } from "..";
import { Database } from "../database/Database";

export async function defaultDataProcess(data: any, contractFunctions: Bucket<ethers.ContractFunction>) {
    return data.toString();
}

export interface EventInfoDataStruct { [property: string]: any; }

export declare interface Strategies {
    DataExtractionStrategy: DataExtractionStrategies;
    PersistenceStrategy: PersistenceStrategies;
}

export interface DataExtractionStrategies { [iteration: number]: DataExtractionStrategy; }

export declare interface DataExtractionStrategy {
    propName: string;
    strategy: ContractCall | FromData;
}

export interface Strategy {
    process?: Process;
}

export interface ContractCall extends Strategy {
    funcName: string;
    args: { [eidsAttr: string]: CallbackFunction };
    resAttr?: string;
}

export declare interface FromData extends Strategy {
    attrName: string;
}

interface Bucket<T> {
    [name: string]: T;
}

type CallbackFunction = (data: any) => any;

export type Process = (data: any, contractFunctions: Bucket<ethers.ContractFunction>) => Promise<any>;

export declare interface PersistenceStrategies {
    NodeStrategies: { [iteration: number]: NodeStrategy };
    RelationshipStrategies: { [iteration: number]: RelationshipStrategy };
}

export declare interface RelationshipStrategy {
    relType: string;
    relAlias: string;
    direction: string;
    source: string;
    target: string;
    createStrategy: CreateStrategy;
}

export declare interface NodeStrategy {
    nodeType: string;
    nodeAlias: string;
    mergeStrategy: MergeStrategy;
    createStrategy: CreateStrategy;
}

// For each dbProp, use an entry from the extracted data struct
export interface MergeStrategy { [dbProp: string]: string; }
export interface CreateStrategy { [dbProp: string]: string; }

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
     * Load the strategies to the watcher
     * @param strategies the user-defined strategy to extract and persists data
     */
    public abstract setStrategies(strategies: Strategies): void;

    /**
    * Tell the Watcher to clear the database before the next operation
    * @param clearFlag
    */
    public abstract setClearDBFlag(clearFlag: boolean): void;
}

export { Watcher };
