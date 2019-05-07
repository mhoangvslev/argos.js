import { argos } from "./index";
import * as Neode from "neode";

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
     * @param {Neode.Node<any>} start start node
     * @param {Neode.Node<any>} end end node
     * @param {string} startToEnd relationship name from model
     * @param {string} endToStart relationship name from model
     * @param {object} relProps relationship properties
     */
    public abstract dbRelateNodes(start: Neode.Node<any>, end: Neode.Node<any>, startToEnd: string, endToStart: string, relProps: object): Promise<any>;

    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} relType relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    public abstract dbCreateNodes(startProps: object, endProps: object, relType: string, relProps: object): Promise<void>;
}