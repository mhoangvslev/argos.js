'use strict'

import Neo4J from "../database/Neo4J";
import Database from "../database/Database";

export const DatabaseEnum = {
    Neo4J: 0,
}

export default class DatabaseFactory{
    /**
     * Create a database instance
     * @param {import("../../types").DatabaseConstructor} args the arguments corresponding to the class
     * @returns {Database} a database instance or nothing
     */
    static createDbInstance(args){
        switch (args.type){
            case DatabaseEnum.Neo4J:
                return new Neo4J(args.config.bolt, args.config.username, args.config.password);
            default:
                return undefined;
        }
    }
}

export { DatabaseFactory };