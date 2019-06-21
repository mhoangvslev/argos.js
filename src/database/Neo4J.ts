import { Record, Session } from "neo4j-driver/types/v1";
import Neode = require("neode");
import * as errors from "../utils/error";
import { NodeStrategy, PersistenceStrategies, RelationshipStrategy } from "../utils/strategy";
import { QueryData } from "../utils/types";
import { EventInfoDataStruct } from "../watcher/Watcher";
import { Database, DatabaseConstructor, DatabaseModels } from "./Database";

export interface Neo4JConstructor extends DatabaseConstructor {
    bolt: string;
    http?: string;
    https?: string;
    enterpriseMode?: boolean;
    driverConf: object;
}

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
     * Get all nodes' type
     */
    public getNodeTypes(): string[] {
        const result = Object.keys(this._models);
        // console.log(result);
        return result;
    }

    /**
     * Get all relationships' type
     */
    public getRelTypes(): string[] {
        const result: string[] = [];
        this.getNodeTypes().forEach((model) => {

            // Get all model's relationships
            const localRelTypes = this.findRelationshipModels(model).map((relKey) => {
                const rel = this._models[model][relKey] as Neode.BaseRelationshipNodeProperties;
                return rel.relationship;
            });

            localRelTypes.forEach((localRelType) => {
                if (!result.includes(localRelType)) {
                    result.push(localRelType);
                }
            });
        });

        // console.log(result);
        return result;
    }

    /**
     * Delete all entry in the database
     */
    public async dbClearAll() {
        const cypher: QueryData = {
            query: "MATCH (n) DETACH DELETE n"
        };
        await this.executeQuery(cypher).catch((err) =>
            errors.throwError({
                type: errors.DatabaseError.ERROR_DB_QUERY,
                reason: "Could not clear database",
                params: {
                    query: cypher,
                }
            })
        );
    }

    /**
     * Tell the database to execute a query
     * @param {QueryData} queryData where parameters
     * @returns {Promise<any>} the result of queries
     */
    public async executeQuery(queryData: QueryData): Promise<Record[]> {
        await this.dbReconnect();

        console.log(queryData);

        let result;
        await this._dbInstance.cypher(queryData.query, queryData.params)
            .then((statementResult) => { result = statementResult.records; })
            .catch((err) =>
                errors.throwError({
                    type: errors.DatabaseError.ERROR_DB_QUERY,
                    reason: "Could not execute query",
                    params: {
                        query: queryData
                    }
                })
            );
        return result;
    }

    /**
     * Tell the database to execute a query
     * @param {QueryData[]} queries a string query
     * @returns {Promise<any>} the result of queries
     */
    public async executeQueries(queries: QueryData[]): Promise<any> {
        await this.dbReconnect();
        let result: any;
        await this._dbInstance.batch(queries)
            .then((records) => { result = records; })
            .catch((err) =>
                errors.throwError({
                    type: errors.DatabaseError.ERROR_DB_QUERY,
                    reason: "Could not batch-execute queries"
                })
            );
        return result;
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
                }).catch(() => {
                    errors.throwError({
                        type: errors.DatabaseError.ERROR_DB_IMPORT,
                        reason: "Could not export fileName" + "_rel_" + relationshipProp + ".csv"
                    });
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
                    }).catch(() => {
                        errors.throwError({
                            type: errors.DatabaseError.ERROR_DB_IMPORT,
                            reason: "Could not export fileName" + "_nds_" + relationshipProp + ".csv"
                        });
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
                }).catch(() => {
                    errors.throwError({
                        type: errors.DatabaseError.ERROR_DB_IMPORT,
                        reason: "Could not import fileName" + "_rel_" + relationshipProp + ".csv"
                    });
                });

                if (attributes.length > 1) {
                    const attributeProj = attributes.map((attr) => attr + ": row." + attr);
                    await this.executeQuery({
                        query:
                            "LOAD CSV WITH HEADERS FROM 'file:///" + fileName + "_nds_" + relationshipProp + ".csv' AS row\n" +
                            "MERGE (n:" + relTargetType + " {" + attributeProj.join(", ") + "})\n"
                    }).catch(() => {
                        errors.throwError({
                            type: errors.DatabaseError.ERROR_DB_IMPORT,
                            reason: "Could not import fileName" + "_nds_" + relationshipProp + ".csv"
                        });
                    });
                }
            }
        }
    }

    /**
     * Prepare queries and batch-persist them to DB
     * @param eidss the extracted data
     * @param PS the persistence strategy
     */
    public async persistDataToDB(eidss: EventInfoDataStruct[], PS: PersistenceStrategies) {
        const queries: QueryData[] = [];

        const nodeStrats = (PS as any).NodeStrategy as { [iteration: number]: NodeStrategy };
        const relStrats = (PS as any).RelationshipStrategy as { [iteration: number]: RelationshipStrategy };

        eidss.forEach((eids) => {
            for (const relItr of Object.keys(relStrats)) {
                const relStrat = relStrats[parseInt(relItr)];

                const sourceKey = Object.keys(nodeStrats).filter((itr) => nodeStrats[parseInt(itr)].nodeAlias === relStrat.source)[0];
                const targetKey = Object.keys(nodeStrats).filter((itr) => nodeStrats[parseInt(itr)].nodeAlias === relStrat.target)[0];

                const sourceNode = nodeStrats[parseInt(sourceKey)];
                const targetNode = nodeStrats[parseInt(targetKey)];

                // For example, [ attr: toInteger({preparedParamName}), ... ]
                const sourceMergeStrat = Object.keys(sourceNode.mergeStrategy).map((dbAttr) => {
                    const propType = this.findNodeAttrType(sourceNode, dbAttr);
                    const sanitiser = this.findSanitiser(propType);
                    return dbAttr + ": " + sanitiser + "({" + sourceNode.mergeStrategy[dbAttr] + dbAttr + "})";
                });

                const targetMergeStrat = Object.keys(targetNode.mergeStrategy).map((dbAttr) => {
                    const propType = this.findNodeAttrType(targetNode, dbAttr);
                    const sanitiser = this.findSanitiser(propType);
                    return dbAttr + ": " + sanitiser + "({" + targetNode.mergeStrategy[dbAttr] + dbAttr + "})";
                });

                // For example, [ rel.attr = toInteger({prepareParamName}), ... ]
                const relCreateStrat = Object.keys(relStrat.createStrategy).map((dbAttr) => {
                    const propType = this.findRelationshipAttrType(relStrat, dbAttr);
                    const sanitiser = this.findSanitiser(propType);
                    return relStrat.relAlias + "." + dbAttr + " = " + sanitiser + " ({" + relStrat.createStrategy[dbAttr] + dbAttr + "})";
                });

                // Format for prepared query params: { param1: val1, param2: val2, ... }
                const cypherParams: { [alias: string]: any } = {};
                Object.keys(sourceNode.mergeStrategy).map((dbAttr) => { cypherParams[sourceNode.mergeStrategy[dbAttr] + dbAttr] = eids[sourceNode.mergeStrategy[dbAttr]]; });
                Object.keys(targetNode.mergeStrategy).map((dbAttr) => { cypherParams[targetNode.mergeStrategy[dbAttr] + dbAttr] = eids[targetNode.mergeStrategy[dbAttr]]; });
                Object.keys(relStrat.createStrategy).map((dbAttr) => { cypherParams[relStrat.createStrategy[dbAttr] + dbAttr] = eids[relStrat.createStrategy[dbAttr]]; });

                // Join with ", " (EZ)
                const cypher: QueryData = {
                    query:
                        "MERGE (" + sourceNode.nodeAlias + ":" + sourceNode.nodeType + " {" + sourceMergeStrat.join(", ") + "})\n" +
                        "MERGE (" + targetNode.nodeAlias + ":" + targetNode.nodeType + " {" + targetMergeStrat.join(", ") + "})\n " +
                        "MERGE (" + sourceNode.nodeAlias + ")-[" + relStrat.relAlias + ":" + relStrat.relType + "]->(" + targetNode.nodeAlias + ") " +
                        "ON CREATE SET " + relCreateStrat.join(", ")
                    , params: cypherParams
                };

                // console.log(cypher);
                queries.push(cypher);
            }
        });

        await this.executeQueries(queries).catch(() => {
            errors.throwError({
                type: errors.DatabaseError.ERROR_DB_PERSIST,
                reason: "Could not send data to DB. persistDataToDB(). This is most likely due to bad strategy definition",
            });
        });
    }

    /**
     * Find the type of Node property
     * @param nodeStrat
     * @param propKey
     */
    private findNodeAttrType(nodeStrat: NodeStrategy, propKey: string): string {
        return (this._models[nodeStrat.nodeType][propKey] as Neode.OtherNodeProperties).type;
    }

    /**
     * Find the type of Relationship property
     * @param relStrat
     * @param propKey
     */
    private findRelationshipAttrType(relStrat: RelationshipStrategy, propKey: string): string {

        // Search in the models the model that contain the relationship
        const modelRel = Object.keys(this._models).filter((model) => {
            return this.findRelationshipModels(model).filter((relKey) => {
                return (this._models[model][relKey] as Neode.BaseRelationshipNodeProperties).relationship === relStrat.relType;
            });
        })[0];

        const propType = (this._models[modelRel][relStrat.relAlias] as Neode.BaseRelationshipNodeProperties).properties[propKey];
        return propType;
    }

    /**
     * find the proper neo4j sanitiser for the incoming data as string
     * @param type the type in question. <a src="https://github.com/adam-cowley/neode#property-types">Reference</a>
     */
    private findSanitiser(type: string): string {
        let sanitiser = "";
        switch (type) {
            case "integer":
                sanitiser = "toInteger";
                break;
            case "float": case "number":
                sanitiser = "toFloat";
                break;
            default:
                break;
        }
        return sanitiser;
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
