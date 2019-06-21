import { BlockTag } from "ethers/providers";
import { Networkish } from "ethers/utils";
import { Database } from "../database/Database";
import { Strategies } from "../utils/strategy";
import { ContractType, DatabaseConstructorType, ProviderEnum, ProviderType, WatcherEnum } from "../utils/types";

export interface WatcherConstructor {
    type: WatcherEnum;
    provider: ProviderEnum;
    clearDB: boolean;
    address: string;
    db: DatabaseConstructorType;
    abi: string;
    providerConf: object;
    exportDir: string;
}

export interface ProviderConfig {
    timeout?: number;
    infura?: {
        network?: Networkish,
        projectId?: string
    };
    etherscan?: {
        network?: Networkish,
        api?: string
    };
    jsonrpc?: {
        network: Networkish
        url?: string,
        username?: string,
        password?: string,
        allowInsecure?: boolean
    };
    web3?: {
        host?: string
    };
    ipc?: {
        path?: string;
        network?: Networkish;
    };
}

export interface EventInfoDataStruct { [property: string]: any; }

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
