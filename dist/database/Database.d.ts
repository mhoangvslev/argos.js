import Neode = require("neode");
import { DatabaseModel, NodeType, QueryData } from "..";
export default abstract class Database {
    /**
     * Create a Database
     */
    constructor();
    /**
     * Connect to the database
     */
    abstract dbConnect(): void;
    /**
     * Reconnect to the database
     */
    abstract dbReconnect(): void;
    /**
     * Close connection to the database
     */
    abstract dbTerminate(): void;
    /**
     * Load a model
     * @param {DatabaseModel} model loaded model using require()
     */
    abstract dbCreateModel(model: DatabaseModel): void;
    /**
     * Relate two given nodes
     * @param {NodeType} start start node
     * @param {NodeType} end end node
     * @param {string} relType relationship name from model
     * @param {object} relProps relationship properties
     * @return {Promise<void | Relationship>} the ongoing process
     */
    abstract dbRelateNodes(start: NodeType, end: NodeType, relType: string, relProps: object): Promise<void | Neode.Relationship>;
    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} relType relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    abstract dbCreateNodes(startProps: object, endProps: object, relType: string, relProps: object): Promise<void>;
    /**
     * Delete all entry in the database
     */
    abstract dbClearAll(): void;
    /**
     * Tell the database to execute a query
     * @param {QueryData} query where parameters
     * @returns {Promise<any>} the result of queries
     */
    abstract executeQuery(query: QueryData): Promise<any>;
    /**
     * Tell the database to execute a query
     * @param {string} queries a string query
     * @returns {Promise<any>} the result of queries
     */
    abstract executeQueries(queries: QueryData[]): Promise<any>;
}
export { Database };
