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
    public static createInstance(connection: string, username: string, password: string, enterpriseMode: boolean = false, settings: object = {}) {
        return new Neo4J(connection, username, password, enterpriseMode, settings);
    }
    public _connection: string;
    public _dbInstance: Neode;
    public _dbSession: Session;

    /**
     * Create a connection to Neo4J database
     * @param {string} connection neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     * @param {boolean} enterpriseMode neo4j enterprise mode
     * @param {object} settings neo4 driver settings
     */
    constructor(connection: string, username: string, password: string, enterpriseMode: boolean, settings: object) {
        super();
        this._dbInstance = new Neode(connection, username, password, enterpriseMode);

        this._dbSession = this._dbInstance.session();
    }

    /**
     * Connect to the database
     */
    public dbConnect() {
        return Promise.all([
            this._dbSession = this._dbInstance.session()
        ]);
    }

    /**
     * Reconnect to the database
     */
    public async dbReconnect() {
        await this.dbTerminate();
        await this.dbConnect();
    }

    /**
     * Close connection to the database
     */
    public dbTerminate() {
        return Promise.all([
            this._dbSession.close()
        ]);
    }

    /**
     * Load a model
     * @param {DatabaseModel} model loaded model using require()
     */
    public dbCreateModel(model: DatabaseModel) {
        // console.log('Model: ', model);
        this._dbInstance.with(model);
    }

    /**
     * Delete all entry in the database
     */
    public async dbClearAll() {
        await this._dbInstance.deleteAll("Account").then(() => {
            console.log("Reset database");
        });
    }

    /**
     * Relate two given nodes
     * @param {Neode.Node<any>} start start node
     * @param {Neode.Node<any>} end end node
     * @param {string} relType relationship name from model
     * @param {object} relProps relationship properties
     * @return {Promise<void | Neode.Relationship>} the ongoing process
     */
    public async dbRelateNodes(start: Neode.Node<any>, end: Neode.Node<any>, relType: string, relProps: object): Promise<void | Neode.Relationship> {
        // Create relationships
        return start.relateTo(end, relType, relProps).catch((error) => { console.log("Could not relate nodes", error); });
    }

    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} relType relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    public async dbCreateNodes(startProps: object, endProps: object, relType: string, relProps: object) {
        // Find nodes
        const [start, end] = await Promise.all([
            this._dbInstance.mergeOn("Account", startProps, startProps),
            this._dbInstance.mergeOn("Account", endProps, endProps)

        ]);

        await this.dbRelateNodes(start, end, relType, relProps);
    }

    /**
     * Tell the database to execute a query
     * @param {QueryData} queryData where parameters
     * @returns {Promise<any>} the result of queries
     */
    public async executeQuery(queryData: QueryData): Promise<Record[]> {
        await this.dbReconnect();
        console.log(queryData);
        const summary = await this._dbInstance.cypher(queryData.query, queryData.params);
        return summary.records;
    }

    /**
     * Tell the database to execute a query
     * @param {QueryData[]} queries a string query
     * @returns {Promise<any>} the result of queries
     */
    public async executeQueries(queries: QueryData[]): Promise<any> {
        await this.dbReconnect();
        const summary = await this._dbInstance.batch(queries);
        return summary.records;
    }

}

export { Neo4J };
