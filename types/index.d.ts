import { ethers } from "ethers";
import * as Neode from "neode";
import { v1 as neo4j } from 'neo4j-driver';

import { Neo4J } from './database/Neo4J';
import { Database } from './database/Database';
import { EthereumWatcher, ProviderEnum } from './watcher/EthereumWatcher';
import { Watcher } from "./watcher/Watcher";
import { DatabaseFactory, WatcherFactory, DatabaseEnum, WatcherEnum } from './ArgosFactory';
import { Visualiser, CentralityAlgorithmEnum, CommunityDetectionAlgoritmEnum } from './visualiser/Visualiser'
import { NeoVis } from './visualiser/NeoVis'

export declare namespace argos {
    type ProviderType = ethers.providers.BaseProvider;
    type ContractType = ethers.Contract;
    type NodeType = Neode.Node<any>;
}

export declare interface DatabaseConstructor {
    type: DatabaseEnum
    config: object
    model: object
}

export declare interface WatcherConstructor {
    type: WatcherEnum
    provider: ProviderEnum,
    clearDB: boolean,
    address: string
    db: DatabaseConstructor
    abi: string
    providerConf: object
}

export declare interface EventInfoDataStruct {
    blockNumber: number,
    date: neo4j.DateTime<number>,
    from: string,
    to: string,
    value: string
}

export declare interface QueryData {
    query: string,
    params?: object
}

export { DatabaseFactory, WatcherFactory, Database, Watcher, Neo4J, EthereumWatcher, ProviderEnum, DatabaseEnum, WatcherEnum, NeoVis, Visualiser, CommunityDetectionAlgoritmEnum, CentralityAlgorithmEnum  }

