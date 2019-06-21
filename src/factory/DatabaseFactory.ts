import Database, { DatabaseConstructor } from "../database/Database";
import Neo4J, { Neo4JConstructor } from "../database/Neo4J";

export default class DatabaseFactory {
    /**
     * Create a database instance
     * @param {Neo4JConstructor} args the arguments corresponding to the class
     * @returns {Neo4J} a database instance or nothing
     */
    public static createDbInstance(constructor: DatabaseConstructor): Database {

        if (constructor as Neo4JConstructor) {
            const args = constructor as Neo4JConstructor;
            const instance = Neo4J.createInstance(args.bolt, args.username, args.password, args.enterpriseMode, args.driverConf);
            instance.dbCreateModel(args.model);
            return instance;
        }

        return undefined;
    }
}

export { DatabaseFactory };
