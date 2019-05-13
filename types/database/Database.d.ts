import { argos } from "../index";
import * as Neode from "neode";
import { QueryData } from "../index";

export declare abstract class Database {

    /**
     * Create a Database
     */
    constructor();

    /**
     * Connect to the database
     */
    public abstract dbConnect(): void;

    /**
     * Reconnect to the database
     */
    public abstract dbReconnect(): void;

    /**
     * Close connection to the database
     */
    public abstract dbTerminate(): void;

    /**
     * Load a model
     * @param {Neode.SchemaObject} model loaded model using require()
     */
    public abstract dbCreateModel(model: Neode.SchemaObject): void;

    /**
     * Relate two given nodes
     * @param {argos.NodeType} start start node
     * @param {argos.NodeType} end end node
     * @param {string} relType relationship name from model
     * @param {object} relProps relationship properties
     * @return {Promise<void | Neode.Relationship>} the ongoing process
     */
    public abstract dbRelateNodes(start: argos.NodeType, end: argos.NodeType, relType: string, relProps: object): Promise<void | Neode.Relationship>;

    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} relType relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    public abstract dbCreateNodes(startProps: object, endProps: object, relType: string, relProps: object): Promise<void>;

    /**
     * Delete all entry in the database
     */
    public abstract dbClearAll(): void;

    /**
     * Tell the database to execute a query
     * @param {QueryData} query where parameters
     * @returns {Promise<any>} the result of queries
     */
    public abstract executeQuery(query: QueryData): Promise<any>;

    /**
     * Tell the database to execute a query
     * @param {string} queries a string query 
     * @returns {Promise<any>} the result of queries
     */
    public abstract executeQueries(queries: QueryData[]): Promise<any>;
}