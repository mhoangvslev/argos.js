'use strict'

import Neode from 'neode';
import Database from './Database';

export default class Neo4J extends Database{

    /**
     * Create a connection to Neo4J database
     * @param {string} bolt neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     */
    constructor(bolt, username, password) {
        super();
        this._dbInstance = new Neode(bolt, username, password);
    }

    /**
     * Load a model
     * @param {Neode.SchemaObject} model loaded model using require()
     */
    dbCreateModel(model) {

        this._dbInstance.with({
            'Account': model
        });

        this._dbInstance.deleteAll('Account').then(() => {
            console.log("Reset database");
        });
    }

    /**
     * Relate two given nodes
     * @param {Neode.Node<any>} start start node
     * @param {Neode.Node<any>} end end node
     * @param {string} startToEnd relationship name from model
     * @param {string} endToStart relationship name from model
     * @param {object} relProps relationship properties
     */
    dbRelateNodes(start, end, startToEnd, endToStart, relProps) {
        // Create relationships
        start.relateTo(end, startToEnd, relProps).catch((error) => { console.log("Could not relate nodes", error); });
        end.relateTo(start, endToStart, relProps).catch((error) => { console.log("Could not relate nodes", error); });;
    }

    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} startToEnd relationship name from model
     * @param {string} endToStart relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    dbCreateNodes(startProps, endProps, startToEnd, endToStart, relProps) {

        // Find nodes
        Promise.all([
            this.dbInstance.mergeOn(this.modelAlias, startProps, startProps),
            this.dbInstance.mergeOn(this.modelAlias, endProps, endProps),
        ]).then(

            // On fullfilled
            ([start, end]) => {
                this.dbRelateNodes(start, end, startToEnd, endToStart, relProps);
            },

            // On rejected
            (error) => {
                console.log("Could not create/update node", error);
            }
        );
    }
}

export { Neo4J }