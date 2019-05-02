import { ethers } from "ethers";
import * as Neode from "neode";

import {Argos} from './Argos';
import {Neo4J} from './Neo4J';
import {Database} from './Database';
import {EthereumWatcher} from './EthereumWatcher';
import {Watcher} from "./Watcher";

export declare namespace argos {
    type ProviderType = ethers.providers.Provider;
    type ContractType = ethers.Contract;
    type NodeType = Neode.Node<any>;
}

export { Argos, Database, Watcher, Neo4J, EthereumWatcher }

