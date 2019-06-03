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
                const instance = Neo4J.createInstance(args.config.bolt, args.config.username, args.config.password, args.config.enterpriseMode, args.config.driverConf);
                instance.dbCreateModel(args.model);
                return instance;
            default:
                return undefined;
        }
    }
}

export { DatabaseFactory };