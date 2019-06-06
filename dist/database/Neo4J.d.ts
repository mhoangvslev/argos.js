import { Record, Session } from "neo4j-driver/types/v1";
import Neode = require("neode");
import Database from "./Database";
import { DatabaseModel, QueryData } from "..";
export default class Neo4J extends Database {
    /**
     * Create a connection to Neo4J database
     * @param {string} connection neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     * @param {boolean} enterpriseMode neo4j enterprise mode
     * @param {object} settings neo4 driver settings
     */
    static createInstance(connection: string, username: string, password: string, enterpriseMode?: boolean, settings?: object): Neo4J;
    _connection: string;
    _dbInstance: Neode;
    _dbSession: Session;
    /**
     * Create a connection to Neo4J database
     * @param {string} connection neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     * @param {boolean} enterpriseMode neo4j enterprise mode
     * @param {object} settings neo4 driver settings
     */
    constructor(connection: string, username: string, password: string, enterpriseMode: boolean, settings: object);
    /**
     * Connect to the database
     */
    dbConnect(): Promise<Session[]>;
    /**
     * Reconnect to the database
     */
    dbReconnect(): Promise<void>;
    /**
     * Close connection to the database
     */
    dbTerminate(): Promise<void[]>;
    /**
     * Load a model
     * @param {DatabaseModel} model loaded model using require()
     */
    dbCreateModel(model: DatabaseModel): void;
    /**
     * Delete all entry in the database
     */
    dbClearAll(): Promise<void>;
    /**
     * Relate two given nodes
     * @param {Neode.Node<any>} start start node
     * @param {Neode.Node<any>} end end node
     * @param {string} relType relationship name from model
     * @param {object} relProps relationship properties
     * @return {Promise<void | Neode.Relationship>} the ongoing process
     */
    dbRelateNodes(start: Neode.Node<any>, end: Neode.Node<any>, relType: string, relProps: object): Promise<void | Neode.Relationship>;
    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} relType relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    dbCreateNodes(startProps: object, endProps: object, relType: string, relProps: object): Promise<void>;
    /**
     * Tell the database to execute a query
     * @param {QueryData} queryData where parameters
     * @returns {Promise<any>} the result of queries
     */
    executeQuery(queryData: QueryData): Promise<Record[]>;
    /**
     * Tell the database to execute a query
     * @param {QueryData[]} queries a string query
     * @returns {Promise<any>} the result of queries
     */
    executeQueries(queries: QueryData[]): Promise<any>;
}
export { Neo4J };
