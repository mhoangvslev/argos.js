import { ethers } from "ethers";

export declare interface Strategies {
    DataExtractionStrategy: DataExtractionStrategies;
    PersistenceStrategy: PersistenceStrategies;
}

export interface DataExtractionStrategies { [iteration: number]: DataExtractionStrategy; }

/**
 * Data Extraction Strategy
 */
export declare interface DataExtractionStrategy {
    /**
     * The name tag to be used during the Data Extraction process. EthereumWatcher.extractData()
     */
    propName: string;

    /**
     * The strategy used to extract the data
     */
    strategy: ContractCall | FromData;
}

export interface Strategy {
    /**
     * The function that transforms log's data to database-compatible data
     */
    process?: Process;
}

/**
 * Call a contract methods
 */
export interface ContractCall extends Strategy {
    /**
     * Name of the contract's method. Check the contract's ABI twice.
     */
    funcName: string;

    /**
     * Arguments of the aforementioned method. Check the contract's ABI twice.
     */
    args: { [eidsAttr: string]: CallbackFunction };

    /**
     * In case the contract's method returns multiple result as Object, specify the attribute name. Check the contract's ABI twice.
     */
    resAttr?: string;
}

/**
 * Get the data directly from the log.
 */
export declare interface FromData extends Strategy {
    /**
     * The name tag of the data in the log entry. Check the contract's ABI for the exact name
     */
    attrName: string;
}

interface Bucket<T> {
    [name: string]: T;
}

/**
 * The function that transform the argument to a compatible to the contract's method.
 * Important note: whenever a contract's method is called, the argument will be encoded by etherjs.
 * In case of BigNumber, ethersjs will try to ethers.utils.bignumberify your input first.
 */
type CallbackFunction = (data: any) => any;

export type Process = (data: any, contractFunctions: Bucket<ethers.ContractFunction>) => Promise<any>;

/**
 * Tell Argos how to memorise data
 */
export declare interface PersistenceStrategies {
    /**
     * You can make a "script" by assigning each strategy to a number. Argos will proceed step by step
     */
    NodeStrategies: { [iteration: number]: NodeStrategy };

    /**
     * You can make a "script" by assigning each strategy to a number. Argos will proceed step by step
     */
    RelationshipStrategies: { [iteration: number]: RelationshipStrategy };
}

/**
 *
 */
export declare interface RelationshipStrategy {
    relType: string;
    relAlias: string;
    direction: "in" | "out" | "both";
    source: string;
    target: string;
    createStrategy: CreateStrategy;
}

export declare interface NodeStrategy {
    nodeType: string;
    nodeAlias: string;
    mergeStrategy: MergeStrategy;
}

/**
 * The strategy that will be used to generate Cypher query for sending data to DB
 */
export interface MergeStrategy {
    /**
     * For each "dbProp" defined in the DB model, associate with "propName" of DES
     */
    [dbProp: string]: string;
}

/**
 * The strategy that will be used to generate Cypher query for sending data to DB
 */
export interface CreateStrategy {
    /**
     * For each "dbProp" defined in the DB model, associate with "propName" of DES
     */
    [dbProp: string]: string;
}

/**
 * The default process that stringify the log data. Note that any Process should have the same signature as this
 * @param data the log data
 * @param contractFunctions the set of contract's methods
 */
export async function defaultDataProcess(data: any, contractFunctions: Bucket<ethers.ContractFunction>) {
    return data.toString();
}
