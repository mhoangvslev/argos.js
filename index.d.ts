import { ethers } from "ethers";
import * as Neode from "neode";

export declare namespace argos {
    type ProviderType = ethers.providers.Provider;
    type ContractType = ethers.Contract;
    type NodeType = Neode.Node<any>;
}

export { Argos } from './index';
export { Database } from './src/database/Database';
export { Neo4J } from './src/database/Neo4J';
export { Watcher } from './src/watcher/Watcher';
export { EthereumWatcher } from './src/watcher/EthereumWatcher';

