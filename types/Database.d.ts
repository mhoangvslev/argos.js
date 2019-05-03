import { argos } from "./index";
import * as Neode from "neode";

export declare abstract class Database {
    modelAlias: string;

    /**
     * Create a Database
     */
    constructor();

    /**
     * Load a model
     * @param {Neode.SchemaObject} model loaded model using require()
     */
    public abstract dbCreateModel(model: Neode.SchemaObject): void;

    /**
     * Relate two given nodes
     * @param {argos.NodeType} start start node
     * @param {argos.NodeType} end end node
     * @param {string} startToEnd relationship name from model
     * @param {string} endToStart relationship name from model
     * @param {object} relProps relationship properties
     */
    public abstract dbRelateNodes(start: argos.NodeType, end: argos.NodeType, startToEnd: string, endToStart: string, relProps: object): void;

    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} startToEnd relationship name from model
     * @param {string} endToStart relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    public abstract dbCreateNodes(startProps: object, endProps: object, startToEnd: string, endToStart: string, relProps: object): void;
}