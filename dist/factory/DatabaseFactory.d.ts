import { Neo4JConstructor } from "..";
import Neo4J from "../database/Neo4J";
export default class DatabaseFactory {
    /**
     * Create a database instance
     * @param {Neo4JConstructor} args the arguments corresponding to the class
     * @returns {Neo4J} a database instance or nothing
     */
    static createDbInstance(args: Neo4JConstructor): Neo4J;
}
export { DatabaseFactory };
