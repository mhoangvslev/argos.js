import { Neo4JConstructor } from "..";
import Neo4J from "../database/Neo4J";

export default class DatabaseFactory {
    /**
     * Create a database instance
     * @param {Neo4JConstructor} args the arguments corresponding to the class
     * @returns {Neo4J} a database instance or nothing
     */
    public static createDbInstance(args: Neo4JConstructor): Neo4J {
        const instance = Neo4J.createInstance(args.bolt, args.username, args.password, args.enterpriseMode, args.driverConf);
        instance.dbCreateModel(args.model);
        return instance;
    }
}

export { DatabaseFactory };
