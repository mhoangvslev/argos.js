import { ethers } from "ethers";

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

export async function defaultDataProcess(data: any, contractFunctions: Bucket<ethers.ContractFunction>) {
    return data.toString();
}
