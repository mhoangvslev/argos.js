import { ethers } from "ethers";
import * as Neode from "neode";
import { Neo4JConstructor } from "../database/Neo4J";

export type ProviderType = ethers.providers.BaseProvider;
export type ContractType = ethers.Contract;
export type NodeType = Neode.Node<any>;
export type DatabaseConstructorType = Neo4JConstructor;

export const enum DatabaseEnum {
    Neo4J = 0
}

export const enum WatcherEnum {
    EthereumWatcher = 0
}

export const enum ProviderEnum {
    defaultProvider = 0,
    EtherscanProvider = 1,
    InfuraProvider = 2,
    JsonRpcProvider = 3,
    Web3Provider = 4,
    IpcProvider = 5
}

export interface QueryData {
    query: string;
    params?: { [key: string]: any };
}
