import * as Neode from 'neode';
import Database from './Database';

export default class Neo4J extends Database{

    /**
     * Create a connection to Neo4J database
     * @param {string} bolt 
     * @param {string} username 
     * @param {string} password 
     */
    constructor(bolt, username, password) {
        super();
        this._dbInstance = new Neode(bolt, username, password);
        this._modelAlias = '';
    }

    /**
     * Load a model from file
     * @param {string} pathToModel relative path from current directory to model
     * @param {string} alias alias
     */
    createModel(pathToModel, alias) {

        this._modelAlias = alias;
        this._dbInstance.with({
            alias: require('' + pathToModel)
        });

        this._dbInstance.deleteAll(alias).then(() => {
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
            this._dbInstance.mergeOn(this._modelAlias, startProps, startProps),
            this._dbInstance.mergeOn(this._modelAlias, endProps, endProps),
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