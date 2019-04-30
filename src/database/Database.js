export default class Database{

    /**
     * Create a Database
     */
    constructor() {
        this.modelAlias = '';
    }

    /**
     * Load a model from file
     * @param {string} pathToModel relative path from current directory to model
     * @param {string} alias alias
     */
    createModel(pathToModel, alias) {
        console.log("Creating models...");
    }

    /**
     * Relate two given nodes
     * @param {import("../..").NodeType} start start node
     * @param {import("../..").NodeType} end end node
     * @param {string} startToEnd relationship name from model
     * @param {string} endToStart relationship name from model
     * @param {object} relProps relationship properties
     */
    dbRelateNodes(start, end, startToEnd, endToStart, relProps) {
        console.log("Relating nodes...");
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
        console.log("Creating ndoes...");
    }
}