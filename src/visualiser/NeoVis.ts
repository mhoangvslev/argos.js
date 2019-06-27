import { Visualiser } from "./Visualiser";

import { v1 as neo4j } from "neo4j-driver";
import { NeoVis as NeoViz, NeoVisConfig, VisualisationStrategy } from "neovis-ts";
import { Neo4JConstructor } from "../database/Neo4J";
import { CentralityAlgorithmEnum, CentralityAlgorithmParam, CommunityDetectionAlgoritmEnum, CommunityDetectionParam, PathFindingAlgorithmEnum, PathFindingAlgorithmParam } from "../utils/graph";
import { QueryData } from "../utils/types";

export default class NeoVis extends Visualiser {
    private _renderer: NeoViz;
    private _extraProps: string[];
    private _queryLimit: number = 25;
    private _config: NeoVisConfig;

    /**
     * Create a NeoVis visualiser instance from neo4j db config
     * @param {Neo4JConstructor} dbConfig the loaded db config file
     * @param {string} containerId the html element that holds the visualiser
     * @param {NeovisConfig} neovis NeoVis properties
     */
    constructor(dbConfig: Neo4JConstructor, containerId: string, neovis: any) {
        super();

        this._config = {
            container_id: containerId,

            server_url: dbConfig.bolt,
            server_user: dbConfig.username,
            server_password: dbConfig.password,

            node: neovis.node,
            relationship: neovis.relationship,

            visOptions: {
                edges: {
                    arrows: {
                        to: neovis.arrows
                    }
                },
                layout: neovis.layout
            },

            initial_cypher: "MATCH (n)-[r]->(m)\n" +
                /*"WITH DISTINCT n\n" +
                "ORDER BY n.size DESC\n" +
                "WITH n.community as community, collect(n) as nds\n" +
                "WITH community, head(nds) as pole\n" +
                "MATCH (pole)\n" +*/
                "RETURN n, r, m LIMIT 25"
        };

        this._renderer = new NeoViz(this._config);
        this._extraProps = [];

        this._renderer.registerOnEvent("selectNode", (nodes: neo4j.Record[]) => {
            for (const node of nodes) {
                console.log(node.get("n").properties);
            }
        });

        this._renderer.registerOnEvent("selectEdge", (edges: neo4j.Record[]) => {
            for (const edge of edges) {
                console.log(edge.get("r").properties);
            }
        });

        this.refresh();
    }

    /**
     * Find the shortest path or evaluate the availability / quality of nodes
     * See <a href="">Path finding algorithms </a> for more details
     * @param  { PathFindingAlgorithmParam } args the remaining parameters
     */
    public pathfinding(args: PathFindingAlgorithmParam) {
        if (args === undefined) {
            console.log("No Pathfinding Algorithm selected!");
            return;
        }

        let query: QueryData;

        switch (args.algo) {
            case PathFindingAlgorithmEnum.None: default:
                return;

            case PathFindingAlgorithmEnum.MinimumWeightSpanningTree:
                args.param.label = args.param.label || null;
                args.param.relationshipType = args.param.relationshipType || null;
                args.param.weightProperty = args.param.weightProperty || this._config.relationship.thickness || "pth_mst_weight";
                args.param.startNodeId = args.param.startNodeId || null;
                args.param.write = args.param.write || true;
                args.param.writeProperty = args.param.writeProperty || this._config.node.community;

                query = {
                    query: "CALL algo.spanningTree({label}, {relationshipType}, {weightProperty}, {startNodeId}, {writeProperty: {writeProperty}})\nYIELD loadMillis, computeMillis, writeMillis, effectiveNodeCount",
                    params: {
                        label: args.param.label,
                        relationshipType: args.param.relationshipType,
                        weightProperty: args.param.weightProperty,
                        startNodeId: args.param.startNodeId,
                    }
                };
                break;

            case PathFindingAlgorithmEnum.ShortestPath:
                args.param.startNode = args.param.startNode || null;
                args.param.endNode = args.param.endNode || null;
                args.param.weightProperty = args.param.weightProperty || null;
                args.param.defaultValue = args.param.defaultValue || null;
                args.param.write = args.param.write || true;
                args.param.writeProperty = args.param.writeProperty || "sssp";
                args.param.nodeQuery = args.param.nodeQuery || null;
                args.param.relationshipQuery = args.param.relationshipQuery || null;
                args.param.direction = args.param.direction || "outgoing";

                query = {
                    query: "CALL algo.shortestPath({startNode}, {endNode}, {weightProperty}, {nodeQuery: {nodeQuery}, relationshipQuery: {relationshipQuery}, defaultValue: {defaultValue}, write: {write}, writeProperty: {writeProperty}, direction: {direction}}) YIELD nodeCount, totalCost, loadMillis, evalMillis, writeMillis",
                    params: {
                        startNode: args.param.startNode,
                        endNode: args.param.endNode,
                        weightProperty: args.param.weightProperty,
                        nodeQuery: args.param.nodeQuery,
                        relationshipQuery: args.param.relationshipQuery,
                        defaultValue: args.param.defaultValue,
                        write: args.param.write,
                        writeProperty: args.param.writeProperty,
                        direction: args.param.direction
                    }
                };
                break;

            case PathFindingAlgorithmEnum.SingleSourceShortestPath:
                args.param.startNode = args.param.startNode || null;
                args.param.weightProperty = args.param.weightProperty || null;
                args.param.delta = args.param.delta || null;
                args.param.write = args.param.write || true;
                args.param.writeProperty = args.param.writeProperty || "sssp";
                args.param.nodeQuery = args.param.nodeQuery || null;
                args.param.relationshipQuery = args.param.relationshipQuery || null;
                args.param.direction = args.param.direction || "outgoing";

                query = {
                    query: "CALL algo.shortestPath.deltaStepping({startNode}, {weightProperty}, {delta}, {defaultValue: {defaultValue}, write: {write}, writeProperty: {writeProperty}}) YIELD nodeCount, loadDuration, evalDuration, writeDuration",
                    params: args.param
                };
                break;

            case PathFindingAlgorithmEnum.AllPairsShortestPath:
                args.param.weightProperty = args.param.weightProperty || null;
                args.param.nodeQuery = args.param.nodeQuery || null;
                args.param.relationshipQuery = args.param.relationshipQuery || null;
                args.param.defaultValue = args.param.defaultValue || null;

                query = {
                    query: "CALL algo.allShortestPaths.stream({weightProperty}, {nodeQuery: {nodeQuery}, relationshipQuery: {relationshipQuery}, defaultValue: {defaultValue}}) YIELD sourceNodeId, targetNodeId, distance",
                    params: {
                        weightProperty: args.param.weightProperty,
                        nodeQuery: args.param.nodeQuery,
                        relationshipQuery: args.param.relationshipQuery,
                        defaultValue: args.param.defaultValue
                    }
                };

                break;

            case PathFindingAlgorithmEnum.AStar:
                args.param.startNode = args.param.startNode || null;
                args.param.endNode = args.param.endNode || null;
                args.param.weightProperty = args.param.weightProperty || null;
                args.param.defaultValue = args.param.defaultValue || null;
                args.param.propertyKeyLat = args.param.propertyKeyLat || null;
                args.param.propertyKeyLon = args.param.propertyKeyLon || null;
                args.param.nodeQuery = args.param.nodeQuery || null;
                args.param.relationshipQuery = args.param.relationshipQuery || null;
                args.param.direction = args.param.direction || "outgoing";

                query = {
                    query: "CALL algo.shortestPath.astar.stream(({startNode}, {endNode}, {weightProperty}, {propertyKeyLat}, {propertyKeyLon}, {nodeQuery: {nodeQuery}, relationshipQuery: {relationshipQuery}, direction: {direction}, defaultValue: {defaultValue}}) YIELD nodeId, cost",
                    params: {
                        startNode: args.param.startNode,
                        endNode: args.param.endNode,
                        weightProperty: args.param.weightProperty,
                        propertyKeyLat: args.param.propertyKeyLat,
                        propertyKeyLon: args.param.propertyKeyLon,
                        nodeQuery: args.param.nodeQuery,
                        relationshipQuery: args.param.relationshipQuery,
                        direction: args.param.direction,
                        defaultValue: args.param.defaultValue
                    }
                };

                break;

            case PathFindingAlgorithmEnum.KShortestPath:
                args.param.startNode = args.param.startNode || null;
                args.param.endNode = args.param.endNode || null;
                args.param.k = args.param.k ? args.param.k : null;
                args.param.weightProperty = args.param.weightProperty || null;
                args.param.defaultValue = args.param.defaultValue || null;
                args.param.write = args.param.write || true;
                args.param.writeProperty = args.param.writeProperty || "sssp";
                args.param.nodeQuery = args.param.nodeQuery || null;
                args.param.relationshipQuery = args.param.relationshipQuery || null;
                args.param.direction = args.param.direction || "outgoing";
                args.param.maxDepth = args.param.maxDepth || neo4j.Integer.MAX_VALUE;
                args.param.writePropertyPrefix = args.param.writePropertyPrefix ? args.param.writePropertyPrefix : "PATH_";

                query = {
                    query: "CALL algo.kShortestPaths({startNode}, {endNode}, {k}, {weightProperty}, {nodeQuery: {nodeQuery}, relationshipQuery: {relationshipQuery}, direction: {direction}, defaultValue: {defaultValue}, maxDepth: {maxDepth}, write: {write}, writePropertyPrefix: {writePropertyPrefix}}) YIELD resultCount, loadMillis, evalMillis, writeMillis",
                    params: args.param
                };
                break;

            case PathFindingAlgorithmEnum.RandomWalk:
                args.param.start = args.param.start ? args.param.start : null;
                args.param.steps = args.param.steps ? args.param.steps : 10;
                args.param.walks = args.param.walks ? args.param.walks : 1;
                args.param.graph = args.param.graph ? args.param.graph : "heavy";
                args.param.nodeQuery = args.param.nodeQuery || null;
                args.param.relationshipQuery = args.param.relationshipQuery || null;
                args.param.direction = args.param.direction || "both";
                args.param.mode = args.param.mode ? args.param.mode : "random";
                args.param.inOut = args.param.inOut ? args.param.inOut : 1.0;
                args.param.return = args.param.return ? args.param.return : 1.0;
                args.param.path = args.param.path ? args.param.path : false;

                query = {
                    query: "CALL algo.randomWalk.stream({start}, {steps}, {walks}, {graph: {graph}, nodeQuery: {nodeQuery}, relationshipQuery: {relationshipQuery}, direction: {direction}, mode: {mode}, inOut: {inOut}, return: {return}, path: {path}}) YIELD nodes, path",
                    params: args.param
                };
                break;
        }

        console.log(query);
        this.renderWithCypher(query);
    }

    /**
     * Determine nodes' importance using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/centrality/"> Centrality algorithms </a> for more details
     * @param {CentralityAlgorithmEnum} algo CentralityAlgorithm
     * @param  {CentralityAlgorithmParam} args the remaining parameters
     */
    public centrality(algo: CentralityAlgorithmEnum, args: CentralityAlgorithmParam) {

        if (algo === undefined) {
            console.log("No Centrality Algorithm selected!");
            return;
        }

        args.label = args.label || null;
        args.relationship = args.relationship || null;
        args.direction = args.direction || "outgoing";
        args.iterations = args.iterations || 20;
        args.dampingFactor = args.dampingFactor || 0.85;
        args.weightProperty = args.weightProperty || this._config.relationship.thickness || "weight";
        args.defaultValue = args.defaultValue || 0.0;
        args.write = args.write || true;
        args.graph = args.graph || "heavy";
        args.stats = args.stats || true;
        args.writeProperty = args.writeProperty || this._config.node.size;

        let query;
        switch (algo) {
            case CentralityAlgorithmEnum.None: default:
                return;

            case CentralityAlgorithmEnum.PageRank:
                args.writeProperty = args.writeProperty || "pagerank";

                query = {
                    query: "CALL algo.pageRank({label}, {relationship}, {direction: {direction}, iterations: {iterations}, dampingFactor: {dampingFactor}, write: {write}, writeProperty: {writeProperty}})\nYIELD nodes, iterations, loadMillis, computeMillis, writeMillis, dampingFactor, write, writeProperty",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        direction: args.direction,
                        iterations: args.iterations,
                        dampingFactor: args.dampingFactor,
                        write: args.write,
                        writeProperty: args.writeProperty
                    }
                };
                break;

            case CentralityAlgorithmEnum.ArticleRank:

                args.writeProperty = args.writeProperty || "pagerank";

                query = {
                    query: "CALL algo.articleRank({label}, {relationship}, {iterations: {iterations}, dampingFactor: {dampingFactor}, write: {write}, writeProperty: {writeProperty}})\nYIELD nodes, iterations, loadMillis, computeMillis, writeMillis, dampingFactor, write, writeProperty",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        iterations: args.iterations,
                        dampingFactor: args.dampingFactor,
                        write: args.write,
                        writeProperty: args.writeProperty
                    }
                };
                break;

            case CentralityAlgorithmEnum.BetweenessCentrality:

                args.writeProperty = args.writeProperty || "centrality";

                query = {
                    query: "CALL algo.betweenness({label}, {relationship}, {direction: {direction}, write: {write}, stats: {stats}, writeProperty: {writeProperty}})\nYIELD nodes, minCentrality, maxCentrality, sumCentrality, loadMillis, computeMillis, writeMillis",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        direction: args.direction,
                        write: args.write,
                        stats: args.stats,
                        writeProperty: args.writeProperty
                    }
                };
                break;

            case CentralityAlgorithmEnum.ClosenessCentrality:

                args.writeProperty = args.writeProperty || "centrality";

                query = {
                    query: "CALL algo.closeness({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}, graph: {graph}})\nYIELD nodes, loadMillis, computeMillis, writeMillis",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty,
                        graph: args.graph
                    }
                };
                break;

            case CentralityAlgorithmEnum.HarmonicCentrality:

                args.writeProperty = args.writeProperty || "centrality";

                query = {
                    query: "CALL algo.closeness.harmonic({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}, graph: {graph}})\nYIELD nodes, loadMillis, computeMillis, writeMillis",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty,
                        graph: args.graph
                    }
                };
                break;

            case CentralityAlgorithmEnum.EigenvectorCentrality:

                args.writeProperty = args.writeProperty || "eigenvector";

                query = {
                    query: "CALL algo.eigenvector({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}})\nYIELD nodes, loadMillis, computeMillis, writeMillis, write, writeProperty",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty
                    }
                };
                break;

            case CentralityAlgorithmEnum.DegreeCentrality:

                args.writeProperty = args.writeProperty || "degree";

                query = {
                    query: "CALL algo.degree({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}})\nYIELD nodes, loadMillis, computeMillis, writeMillis, write, writeProperty",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty
                    }
                };
                break;
        }

        console.log(query);
        this.renderWithCypher(query);
    }

    /**
     * Detect communities using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/community/"> Community detection algorithms </a> for more details
     * @param {CommunityDetectionAlgoritmEnum} algo CommunityDetectionAlgorithm
     * @param  {CommunityDetectionParam} args the remaining parameters
     */
    public detectCommunity(algo: CommunityDetectionAlgoritmEnum, args: CommunityDetectionParam) {

        if (algo === undefined) {
            console.log("No CommunityDetectionAlgorithm selected!");
            return;
        }

        let query;

        args.label = args.label || null;
        args.relationship = args.relationship || null;
        args.direction = args.direction || "outgoing";
        args.iterations = args.iterations || 1;
        args.weightProperty = args.weightProperty || this._config.relationship.thickness || "weight";
        args.defaultValue = args.defaultValue || null;
        args.write = args.write || true;
        args.graph = args.graph || "heavy";
        args.writeProperty = args.writeProperty || this._config.node.community || "community";
        args.threshold = args.threshold || null;
        args.partitionProperty = args.partitionProperty || this._config.node.community || "community";
        args.clusteringCoefficientProperty = args.clusteringCoefficientProperty || "coefficient";

        switch (algo) {
            case CommunityDetectionAlgoritmEnum.None: default:
                return;

            case CommunityDetectionAlgoritmEnum.Louvain:
                this._extraProps.push("unbalanced", "balanced");

                query = {
                    query: "CALL algo.louvain({label}, {relationship}, { weightProperty: {weightProperty}, defaultValue: {defaultValue}, write: {write}, writeProperty: {writeProperty} })\nYIELD nodes, communityCount, iterations, loadMillis, computeMillis, writeMillis",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        weightProperty: args.weightProperty,
                        defaultValue: args.defaultValue,
                        write: args.write,
                        writeProperty: args.writeProperty
                    }
                };
                break;

            case CommunityDetectionAlgoritmEnum.LabelPropagation:

                query = {
                    query: "CALL algo.labelPropagation({label}, {relationship}, {iterations:1, weightProperty: {weightProperty}, writeProperty: {writeProperty}, write: {write}})\nYIELD nodes, iterations, didConverge, loadMillis, computeMillis, writeMillis, write, weightProperty, writeProperty",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        iterations: args.iterations,
                        weightProperty: args.weightProperty,
                        write: args.write,
                        writeProperty: args.writeProperty
                    }
                };
                break;

            case CommunityDetectionAlgoritmEnum.ConnectedComponents:
                query = {
                    query: "CALL algo.unionFind({label}, {relationship}, {threshold:{threshold}, defaultValue:{defaultValue}, write: {write}, writeProperty: {writeProperty}, weightProperty: {weightProperty}, graph:{graph}, partitionProperty: {partitionProperty}})\nYIELD nodes, setCount, loadMillis, computeMillis, writeMillis",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        threshold: args.threshold,
                        defaultValue: args.defaultValue,
                        weightProperty: args.weightProperty,
                        write: args.write,
                        writeProperty: args.writeProperty,
                        graph: args.graph,
                        partitionProperty: args.partitionProperty
                    }
                };
                break;

            case CommunityDetectionAlgoritmEnum.StronglyConnectedComponents:
                query = {
                    query: "CALL algo.scc({label}, {relationship}, {write: {write},writeProperty: {writeProperty}, graph: {graph}})\nYIELD loadMillis, computeMillis, writeMillis, setCount, maxSetSize, minSetSize",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty,
                        graph: args.graph
                    }
                };
                break;

            case CommunityDetectionAlgoritmEnum.ClusteringCoefficient:
                query = {
                    query: "CALL algo.triangleCount({label}, {relationship}, {write:{write}, writeProperty:{writeProperty}})\nYIELD loadMillis, computeMillis, writeMillis, nodeCount, triangleCount, averageClusteringCoefficient",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty
                    }
                };
                break;

            case CommunityDetectionAlgoritmEnum.BalancedTriads:
                query = {
                    query: "CALL algo.balancedTriads({label}, {relationship}, {write:{write}, writeProperty:{writeProperty}, weightProperty: {weightProperty}})\nYIELD loadMillis, computeMillis, writeMillis, nodeCount, balancedTriadCount, unbalancedTriadCount",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty,
                        weightProperty: args.weightProperty
                    }
                };
                break;
        }

        console.log(query);
        this.renderWithCypher(query, this._queryLimit);
    }

    /**
     * Tell the visualiser to render
     */
    public refresh() {
        try {
            this._renderer.reload();
        } catch (e) {
            this._renderer.render();
        }
    }

    /**
     * Make neojs render the selected nodes returned by the cypher query
     * @param {QueryData} querydata
     * @param {number} queryLimit whether to display the outcome
     */
    public renderWithCypher(querydata: QueryData, queryLimit?: number) {
        let cypher = querydata.query;

        if (querydata.params) {
            for (const param of Object.keys(querydata.params)) {
                let arg = querydata.params[param];
                switch (typeof arg) {
                    case "string":
                        arg = "'" + arg + "'";
                        break;
                    default:
                        break;
                }
                cypher = cypher.replace("{" + param + "}", arg);
            }
        }

        const limitString = (queryLimit && queryLimit === 0) ? "" : " LIMIT " + this._queryLimit;
        cypher = [cypher, this._config.initial_cypher.replace("LIMIT 25", limitString)].join("\n");
        console.log(cypher);
        this._renderer.renderWithCypher(cypher);
    }

    /**
     * Make neojs render the selected nodes returned by the cypher query
     * @param {QueryData} querydata
     * @param {number} queryLimit whether to display the outcome
     */
    public displayWithCypher(querydata: QueryData, queryLimit?: number) {
        if (!querydata.query.includes("MATCH")) {
            return;
        }

        const limitString = (queryLimit && queryLimit === 0) ? "" : " LIMIT " + this._queryLimit;
        let cypher = querydata.query;
        if (querydata.params) {
            for (const param of Object.keys(querydata.params)) {
                let arg = querydata.params[param];
                switch (typeof arg) {
                    case "string":
                        arg = "'" + arg + "'";
                        break;
                    default:
                        break;
                }
                cypher = cypher.replace("{" + param + "}", arg);
            }
        }

        cypher += limitString;

        console.log(cypher);
        this._renderer.renderWithCypher(cypher);
    }

    /**
     * Remove all styling elements by removing calculated properties on db nodes
     */
    public async clear() {
        const cypher = "MATCH (n) REMOVE " + this._extraProps.map((prop) => "n." + prop).join(", ");
        this.displayWithCypher({ query: cypher });
    }

    /**
     * See community's evolution over time
     * @param {number} fromBlock fromBlock
     * @param {number} toBlock toBlock
     * @param {number} community community id (depends on graph algorithm)
     */
    public filterCommunityByDateRange(fromBlock: number, toBlock: number, community: number = undefined) {
        let cypher = "MATCH (n)-[r]->(m) WHERE datetime({epochMillis: {fromBlock}}) <= datetime(r.date) <= datetime({epochMillis: {toBlock}})";
        if (community) {
            cypher += " AND (n.community = " + community + " OR m.community = " + community + ") ";
        }

        cypher += " RETURN n,r,m";

        this.displayWithCypher({
            query: cypher,
            params: { fromBlock, toBlock }
        }, this._queryLimit);
    }

    /**
     * Focus on a node of this specific address
     * @param {string} nodeAddress
     */
    public focusOnNode(nodeAddress: string) {
        this._renderer.focusOnNode("address", nodeAddress, {
            scale: 1.0,
        });
    }

    /**
     * Change queryLimit
     * @param {number} newLimit
     */
    public setQueryLimit(newLimit: number) {
        console.log("NeoVis module: set query limit to " + newLimit);
        this._queryLimit = newLimit;
        this.displayWithCypher({
            query: "MATCH (n)-[r]->(m) RETURN n, r, m"
        });
    }

    public setVisualisationStrategy(vs: VisualisationStrategy) {
        this._renderer.setStrategy(vs);
    }
}

export { NeoVis };
