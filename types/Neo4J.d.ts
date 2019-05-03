import { Database } from "./Database";
import * as Neode from "neode";

export declare class Neo4J extends Database {

    readonly dbInstance: Neode;

    /**
     * Create a connection to Neo4J database
     * @param {string} bolt neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     */
    constructor(bolt: string, username: string, password: string);

    /**
     * Load a model
     * @param {Neode.SchemaObject} model loaded model using require()
     */
    public dbCreateModel(model: Neode.SchemaObject): void;

    /**
     * Relate two given nodes
     * @param {Neode.Node<any>} start start node
     * @param {Neode.Node<any>} end end node
     * @param {string} startToEnd relationship name from model
     * @param {string} endToStart relationship name from model
     * @param {object} relProps relationship properties
     */
    public dbRelateNodes(start: Neode.Node<any>, end: Neode.Node<any>, startToEnd: string, endToStart: string, relProps: object): void;

    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} startToEnd relationship name from model
     * @param {string} endToStart relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    public dbCreateNodes(startProps: object, endProps: object, startToEnd: string, endToStart: string, relProps: object): void;
}