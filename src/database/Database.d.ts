import { argos } from "../..";

export declare class Database {
    modelAlias: string;

    /**
     * Create a Database
     * @returns {Database}
     */
    constructor();

    /**
     * Load a model from file
     * @param {string} pathToModel relative path from current directory to model
     * @param {string} alias alias
     */
    createModel(pathToModel: string, alias: string): void;

    /**
     * Relate two given nodes
     * @param {argos.NodeType} start start node
     * @param {argos.NodeType} end end node
     * @param {string} startToEnd relationship name from model
     * @param {string} endToStart relationship name from model
     * @param {object} relProps relationship properties
     */
    dbRelateNodes(start: argos.NodeType, end: argos.NodeType, startToEnd: string, endToStart: string, relProps: object): void;

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