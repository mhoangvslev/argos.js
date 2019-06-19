import { Record, Session } from "neo4j-driver/types/v1";
import Neode = require("neode");
import Database from "./Database";

import { DatabaseModels, QueryData } from "..";

export default class Neo4J extends Database {

    /**
     * Create a connection to Neo4J database
     * @param {string} connection neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     * @param {boolean} enterpriseMode neo4j enterprise mode
     * @param {object} settings neo4 driver settings
     */
    public static createInstance(connection: string, username: string, password: string, enterpriseMode: boolean = false, settings: object = {}) {
        return new Neo4J(connection, username, password, enterpriseMode, settings);
    }

    private _dbInstance: Neode;
    private _dbSession: Session;
    private _models: DatabaseModels;

    /**
     * Create a connection to Neo4J database
     * @param {string} connection neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     * @param {boolean} enterpriseMode neo4j enterprise mode
     * @param {object} settings neo4 driver settings
     */
    constructor(connection: string, username: string, password: string, enterpriseMode: boolean, settings: object) {
        super();
        this._dbInstance = new Neode(connection, username, password, enterpriseMode);

        this._dbSession = this._dbInstance.session();
    }

    /**
     * Connect to the database
     */
    public dbConnect() {
        return Promise.all([
            this._dbSession = this._dbInstance.session()
        ]);
    }

    /**
     * Reconnect to the database
     */
    public async dbReconnect() {
        await this.dbTerminate();
        await this.dbConnect();
    }

    /**
     * Close connection to the database
     */
    public dbTerminate() {
        return Promise.all([
            this._dbSession.close()
        ]);
    }

    /**
     * Load a model
     * @param {DatabaseModels} model loaded model using require()
     */
    public dbCreateModel(model: DatabaseModels) {
        // console.log("Model: ", model, this._dbInstance);
        this._dbInstance = this._dbInstance.with(model);
        this._models = model;
    }

    /**
     * Delete all entry in the database
     */
    public async dbClearAll() {
        for (const model of Object.keys(this._models)) {
            await this._dbInstance.deleteAll(model).then(() => {
                console.log("Reset database");
            });
        }
    }

    /**
     * Tell the database to execute a query
     * @param {QueryData} queryData where parameters
     * @returns {Promise<any>} the result of queries
     */
    public async executeQuery(queryData: QueryData): Promise<Record[]> {
        await this.dbReconnect();
        console.log(queryData);
        const summary = await this._dbInstance.cypher(queryData.query, queryData.params);
        return summary.records;
    }

    /**
     * Tell the database to execute a query
     * @param {QueryData[]} queries a string query
     * @returns {Promise<any>} the result of queries
     */
    public async executeQueries(queries: QueryData[]): Promise<any> {
        await this.dbReconnect();
        const summary = await this._dbInstance.batch(queries);
        return summary.records;
    }

    /**
     *
     * @param fileName
     */
    public async exportCSV(fileName: string) {

        // For each model
        for (const modelName of Object.keys(this._models)) {

            // Export the relationships to CSV
            const relationshipProps = this.findRelationshipModels(modelName);
            const model = this._models[modelName];

            for (const relationshipProp of relationshipProps) {
                const rel = model[relationshipProp] as Neode.BaseRelationshipNodeProperties;

                if (rel === undefined) { continue; }

                const relType = rel.relationship;
                const relTargetType = rel.target;
                const relProps = Object.keys(rel.properties).sort();
                const attributes = this.findAttributesModels(modelName);
                const primaryAttribut = attributes.filter((attribute) => Object.keys(this._models[modelName][attribute]).includes("primary"));

                const relPropsProj = relProps.map((projection) => "r." + projection + " AS " + projection);
                await this.executeQuery({
                    query: "CALL apoc.export.csv.query({query}, {file}, {config}) YIELD file, source, format, nodes, relationships, properties, time, rows, data",
                    params: {
                        query: "MATCH (src:" + relTargetType + ")-[r:" + relType + "]->(tgt:" + relTargetType + ") RETURN " + relPropsProj.join(", ") + ", tgt." + primaryAttribut + " AS target, src." + primaryAttribut + " AS source",
                        file: fileName + "_rel_" + relationshipProp + ".csv",
                        config: null
                    }
                });

                if (attributes.length > 1) {
                    const attributeProj = attributes.map((attr) => "n." + attr + " AS " + attr);
                    await this.executeQuery({
                        query: "CALL apoc.export.csv.query({query}, {file}, {config}) YIELD file, source, format, nodes, relationships, properties, time, rows, data",
                        params: {
                            query: "MATCH (n: " + relTargetType + ") RETURN " + attributeProj.join(", "),
                            file: fileName + "_nds_" + relationshipProp + ".csv",
                            config: null
                        }
                    });
                }
            }
        }
    }

    /**
     * Import from CSV
     */
    public async importCSV(fileName: string) {
        for (const modelName of Object.keys(this._models)) {

            const relationshipProps = this.findRelationshipModels(modelName);
            const model = this._models[modelName];

            for (const relationshipProp of relationshipProps) {
                const rel = model[relationshipProp] as Neode.BaseRelationshipNodeProperties;

                // console.log(rel, this._models);

                if (rel === undefined) { continue; }

                const relType = rel.relationship;
                const relTargetType = rel.target;
                const relProps = Object.keys(rel.properties).sort();
                const attributes = this.findAttributesModels(modelName);
                const primaryAttribut = attributes.filter((attribute) => Object.keys(this._models[modelName][attribute]).includes("primary"));

                const relPropsProj = relProps.map((projection) => "r." + projection + " = row." + projection);
                await this.executeQuery({
                    // e.g 0x7545s465e45.._rel_transfer.csv
                    query:
                        "LOAD CSV WITH HEADERS FROM 'file:///" + fileName + "_rel_" + relationshipProp + ".csv' AS row\n" +
                        "MERGE (src:" + relTargetType + " {" + primaryAttribut + ": row.source})\n" +
                        "MERGE (tgt:" + relTargetType + " {" + primaryAttribut + ": row.target})\n" +
                        "MERGE (src)-[r:" + relType + "]->(tgt) ON CREATE SET " + relPropsProj.join(", ")
                }).catch((err) => { throw err; });

                if (attributes.length > 1) {
                    const attributeProj = attributes.map((attr) => attr + ": row." + attr);
                    await this.executeQuery({
                        query:
                            "LOAD CSV WITH HEADERS FROM 'file:///" + fileName + "_nds_" + relationshipProp + ".csv' AS row\n" +
                            "MERGE (n:" + relTargetType + " {" + attributeProj.join(", ") + "})\n"
                    }).catch((err) => { throw err; });
                }
            }
        }
    }

    private findRelationshipModels(modelKey: string): string[] {
        const model: { [alias: string]: any } = this._models[modelKey];
        const result = Object.keys(model).filter((m) => (model[m].type === "relationship")).sort();
        return result;
    }

    private findAttributesModels(modelKey: string): string[] {
        const model: { [alias: string]: any } = this._models[modelKey];
        const result = Object.keys(model).filter((m) => model[m].type !== "relationship").sort();
        return result;
    }

}

export { Neo4J };
