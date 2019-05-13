import { Database } from "./Database";
import * as Neode from "neode";
import { QueryData } from "../index";

export declare class Neo4J extends Database {

    _dbInstance: Neode;

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
     * Create a connection to Neo4J database
     * @param {string} connection neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     * @param {boolean} enterpriseMode neo4j enterprise mode
     * @param {object} settings neo4 driver settings
     */
    static createInstance(connection: string, username: string, password: string, enterpriseMode: boolean, settings: object): Neo4J;

    /**
     * Connect to the database
     */
    public dbConnect(): void;

    /**
     * Reconnect to the database
     */
    public dbReconnect(): void;

    /**
     * Close connection to the database
     */
    public dbTerminate(): void;

    /**
     * Delete all entry in the database
     */
    public dbClearAll(): void;

    /**
     * Load a model
     * @param {Neode.SchemaObject} model loaded model using require()
     */
    public dbCreateModel(model: Neode.SchemaObject): void;

    /**
     * Relate two given nodes
     * @param {Neode.Node<any>} start start node
     * @param {Neode.Node<any>} end end node
     * @param {string} relType relationship name from model
     * @param {object} relProps relationship properties
     * @return {Promise<void | Neode.Relationship>} the ongoing process
     */
    public dbRelateNodes(start: Neode.Node<any>, end: Neode.Node<any>, relType: string, relProps: object): Promise<void | Neode.Relationship>;

    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} relType relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    public dbCreateNodes(startProps: object, endProps: object, relType: string, relProps: object): Promise<void>;

    /**
     * Tell the database to execute a query
     * @param {QueryData} query where parameters
     * @returns {Promise<any>} the result of queries
     */
    public executeQuery(query: QueryData): Promise<any>;

    /**
     * Tell the database to execute a query
     * @param {string} queries a string query 
     * @returns {Promise<any>} the result of queries
     */
    public executeQueries(queries: QueryData[]): Promise<any>;
}