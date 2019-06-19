import { DatabaseModels, QueryData } from "..";

export default abstract class Database {

    /**
     * Create a Database
     */
    constructor() {
        console.log("Database instance created!");
    }

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
     * @param {DatabaseModels} model loaded model using require()
     */
    public abstract dbCreateModel(model: DatabaseModels): void;

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

    public abstract exportCSV(fileName: string): Promise<any>;

    public abstract importCSV(fileName: string): Promise<any>;

}

export { Database };
