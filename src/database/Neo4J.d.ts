import { Database } from "./Database";
import * as Neode from "neode";

export declare class Neo4J extends Database {

    dbInstance: Neode;

    /**
     * Create a connection to Neo4J database
     * @param {string} bolt neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     * @returns {Neo4J} Neo4J instance
     */
    constructor(bolt: string, username: string, password: string);

    /**
     * Load a model from file
     * @param {string} pathToModel relative path from current directory to model
     * @param {string} alias alias
     */
    createModel(pathToModel: string, alias: string): void;

    /**
     * Relate two given nodes
     * @param {Neode.Node<any>} start start node
     * @param {Neode.Node<any>} end end node
     * @param {string} startToEnd relationship name from model
     * @param {string} endToStart relationship name from model
     * @param {object} relProps relationship properties
     */
    dbRelateNodes(start: Neode.Node<any>, end: Neode.Node<any>, startToEnd: string, endToStart: string, relProps: object): void;

    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} startToEnd relationship name from model
     * @param {string} endToStart relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    dbCreateNodes(startProps: object, endProps: object, startToEnd: string, endToStart: string, relProps: object): void;
}