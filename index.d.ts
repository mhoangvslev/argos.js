import { ethers } from "ethers";
import * as Neode from "neode";

declare namespace argos {

    type ProviderType = ethers.providers.Provider;
    type ContractType = ethers.Contract;

    type NodeType = Neode.Node<any>;

    class Argos {
        watcher: Watcher;
    
        /**
         * Create argos object
         * @param {Watcher} watcher the watcher instance
         * @returns {Argos}
         */
        constructor(watcher: Watcher);
    
        /**
         * Start collecting events and persists data to the database
         */
        initArgos(): void;
    }

    class Database {
        modelAlias: string;

        /**
         * Create a Database
         * @returns {Database}
         */
        constructor();

        /**
         * Load a model from file
         * @param {string} pathToModel relative path from current directory to model
         * @param {string} alias alias
         */
        createModel(pathToModel: string, alias: string): void;

        /**
         * Relate two given nodes
         * @param {NodeType} start start node
         * @param {NodeType} end end node
         * @param {string} startToEnd relationship name from model
         * @param {string} endToStart relationship name from model
         * @param {object} relProps relationship properties
         */
        dbRelateNodes(start: NodeType, end: NodeType, startToEnd: string, endToStart: string, relProps: object): void;

        /**
         * Create a pair of nodes then relate them
         * @param {object} startProps conditions to match start node
         * @param {object} endProps conditions to match end node
         * @param {string} startToEnd relationship name from model
         * @param {string} endToStart relationship name from model
         * @param {object} relProps conditions to relate nodes
         */
        dbCreateNodes(startProps: object, endProps: object, startToEnd: string, endToStart: string, relProps: object): void;
    }

    class Neo4J extends Database {

        dbInstance: Neode;

        /**
         * Create a connection to Neo4J database
         * @param {string} bolt neo4j bolt
         * @param {string} username neo4j username
         * @param {string} password neo4j password
         * @returns {Neo4J} Neo4J instance
         */
        constructor(bolt: string, username: string, password: string);

        /**
         * Load a model from file
         * @param {string} pathToModel relative path from current directory to model
         * @param {string} alias alias
         */
        createModel(pathToModel: string, alias: string): void;

        /**
         * Relate two given nodes
         * @param {Neode.Node<any>} start start node
         * @param {Neode.Node<any>} end end node
         * @param {string} startToEnd relationship name from model
         * @param {string} endToStart relationship name from model
         * @param {object} relProps relationship properties
         */
        dbRelateNodes(start: Neode.Node<any>, end: Neode.Node<any>, startToEnd: string, endToStart: string, relProps: object): void;

        /**
         * Create a pair of nodes then relate them
         * @param {object} startProps conditions to match start node
         * @param {object} endProps conditions to match end node
         * @param {string} startToEnd relationship name from model
         * @param {string} endToStart relationship name from model
         * @param {object} relProps conditions to relate nodes
         */
        dbCreateNodes(startProps: object, endProps: object, startToEnd: string, endToStart: string, relProps: object): void;
    }

    class Watcher {
        argos: Argos
        provider: ProviderType
        dbService: Database
        contract: ContractType

        /**
         * Create a watcher for Ethereum network
         * @param {string} contractAddr the address of the verified contract
         * @param {string} abi the ABI of the verified contract
         * @param {string} apiToken the Etherscan API Token
         * @returns {Watcher}
         */
        constructor(contractAddr: string, abi: string, apiToken: string, dbService: Database);

        /**
         * Get events from log 
         * @param {string} eventName the event name to watch
         * @param {string} fromBlock the start block, default is 0
         * @param {string} toBlock  the ending block, default is 'lastest'
         * @returns {Promise<any[]>}
         */
        getEvents(eventName: string, fromBlock: string, toBlock: string): Promise<any[]>;

        /**
         * Watch eve
         * @param {string} eventName 
         * @returns {Promise<void>}
         */
        watchEvents(eventName: string): Promise<void>;
    }

    class EthereumWatcher extends Watcher {
        provider: ethers.providers.Provider;
        dbService: Database;
        contract: ethers.Contract;

        /**
         * Create a watcher for Ethereum network
         * @param {Argos} argos the argosjs instance
         * @param {string} contractAddr the address of the verified contract
         * @param {string} abi the ABI of the verified contract
         * @param {string} apiToken the Etherscan API Token
         * @param {Database} dbService the database servcice
         * @returns {EthereumWatcher} EthereumWatcher instance
         */
        constructor(contractAddr: string, abi: string, apiToken: string, dbService: Database);

        /**
         * Get events from log 
         * @param {string} eventName the event name to watch
         * @param {string} fromBlock the start block, default is 0
         * @param {string} toBlock  the ending block, default is 'lastest'
         * @returns {Promise<any[]>}
         */
        getEvents(eventName: string, fromBlock: string, toBlock: string): Promise<any[]>;

        /**
         * Watch eve
         * @param {string} eventName 
         * @returns {Promise<void>}
         */
        watchEvents(eventName: string): Promise<void>;
    }
}

export = argos;