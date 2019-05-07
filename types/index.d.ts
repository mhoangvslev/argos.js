import { ethers } from "ethers";
import * as Neode from "neode";

import {Neo4J} from './Neo4J';
import {Database} from './Database';
import {EthereumWatcher, ProviderEnum} from './EthereumWatcher';
import {Watcher} from "./Watcher";

export declare namespace argos {
    type ProviderType = ethers.providers.BaseProvider;
    type ContractType = ethers.Contract;
    type NodeType = Neode.Node<any>;
}

export { Database, Watcher, Neo4J, EthereumWatcher, ProviderEnum }

