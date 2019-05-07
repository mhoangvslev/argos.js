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
     */
    constructor(connection, username, password, enterpriseMode) {
        super();
        this._connection = connection;
        this._username = username;
        this._password = password;
        this._dbInstance = new Neode(this._connection, this._username, this._password, enterpriseMode);
    }

    /**
     * Connect to the database
     */
    dbConnect() {
        this._dbInstance.session();
    }

    /**
     * Reconnect to the database
     */
    dbReconnect() {
        this.dbTerminate();
        this.dbConnect();
    }

    /**
     * Close connection to the database
     */
    dbTerminate() {
        this._dbInstance.close();
    }

    /**
     * Load a model
     * @param {Neode.SchemaObject} model loaded model using require()
     */
    dbCreateModel(model) {

        //this.dbReconnect();

        console.log('Model: ', model);

        this._dbInstance.with({
            'Account': model
        });

        this._dbInstance.deleteAll('Account').then(() => {
            console.log("Reset database");
        });

        //this.dbTerminate();
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
        const [start, end] = await Promise.all([
            this._dbInstance.mergeOn('Account', startProps, startProps),
            this._dbInstance.mergeOn('Account', endProps, endProps),
        ]);

        await this.dbRelateNodes(start, end, relType, relProps);
    }
}

export { Neo4J }