'use strict'

import Neode from 'neode';
import Database from './Database';

export default class Neo4J extends Database {

    /**
     * Create a connection to Neo4J database
     * @param {string} connection neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     * @param {boolean} enterpriseMode neo4j enterprise mode
     * @param {object} settings neo4 driver settings
     */
    constructor(connection, username, password, enterpriseMode, settings) {
        super();
        this._connection = connection;
        this._username = username;
        this._password = password;
        this._dbInstance = new Neode(this._connection, this._username, this._password, enterpriseMode, settings);
        this._dbInstance.with({
            'Account': settings.model
        });
        this._dbSession = this._dbInstance.session();
    }

    /**
     * Create a connection to Neo4J database
     * @param {string} connection neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     * @param {boolean} enterpriseMode neo4j enterprise mode
     * @param {object} settings neo4 driver settings
     */
    static createInstance(connection, username, password, enterpriseMode, settings) {
        return new Neo4J(connection, username, password, enterpriseMode, settings);
    }

    /**
     * Connect to the database
     */
    dbConnect() {
        return Promise.all([
            this._dbSession = this._dbInstance.session()
        ])
    }

    /**
     * Reconnect to the database
     */
    async dbReconnect() {
        await this.dbTerminate();
        await this.dbConnect();
    }

    /**
     * Close connection to the database
     */
    dbTerminate() {
        return Promise.all([
            this._dbSession.close()
        ]);
    }

    /**
     * Load a model
     * @param {Neode.SchemaObject} model loaded model using require()
     */
    dbCreateModel(model) {
        //console.log('Model: ', model);
        this._dbInstance.with({
            'Account': model
        });
    }

    /**
     * Delete all entry in the database
     */
    async dbClearAll() {
        await this._dbInstance.deleteAll('Account').then(() => {
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
    async dbRelateNodes(start, end, relType, relProps) {
        // Create relationships
        return Promise.all([
            start.relateTo(end, relType, relProps).catch((error) => { console.log("Could not relate nodes", error); }),
        ]);
    }

    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} relType relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    async dbCreateNodes(startProps, endProps, relType, relProps) {
        // Find nodes
        let [start, end] = await Promise.all([
            this._dbInstance.mergeOn("Account", startProps, startProps),
            this._dbInstance.mergeOn("Account", endProps, endProps)

        ]);

        await this.dbRelateNodes(start, end, relType, relProps);
    }

    /**
     * Tell the database to execute a query
     * @param {import('../../types').QueryData} query where parameters
     * @returns {Promise<any>} the result of queries
     */
    async executeQuery(queryData) {
        await this.dbReconnect();
        console.log(queryData)
        const summary = await this._dbInstance.cypher(queryData.query, queryData.params);
        return summary.records;
    }

    /**
     * Tell the database to execute a query
     * @param {import('../../types').QueryData[]} queries a string query 
     * @returns {Promise<any>} the result of queries
     */
    async executeQueries(queries) {
        await this.dbReconnect();
        const summary = await this._dbInstance.batch(queries);
        return summary.records;
    }

}

export { Neo4J }