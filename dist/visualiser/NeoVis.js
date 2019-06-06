"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var neo4j_driver_1 = require("neo4j-driver");
var readers_1 = require("typedoc/dist/lib/utils/options/readers");
var Visualiser_1 = require("./Visualiser");
var neovis_js_1 = require("neovis.js");
var NeoVis = /** @class */ (function (_super) {
    __extends(NeoVis, _super);
    /**
     * Create a NeoVis visualiser instance from neo4j db config
     * @param {Neo4JConstructor} dbConfig the loaded db config file
     * @param {string} containerId the html element that holds the visualiser
     * @param {NeovisConfig} neovis NeoVis properties
     */
    function NeoVis(dbConfig, containerId, neovis) {
        var _this = _super.call(this) || this;
        _this._queryLimit = 25;
        _this._config = {
            container_id: containerId,
            server_url: dbConfig.bolt,
            server_user: dbConfig.username,
            server_password: dbConfig.password,
            nodes: neovis.nodes,
            relationships: neovis.relationships,
            visOptions: {
                edges: {
                    arrows: {
                        to: true
                    }
                }
            },
            initial_cypher: "MATCH (n)-[r:TRANSFER]->(m)\n" +
                /*"WITH DISTINCT n\n" +
                "ORDER BY n.size DESC\n" +
                "WITH n.community as community, collect(n) as nds\n" +
                "WITH community, head(nds) as pole\n" +
                "MATCH (pole)\n" +*/
                "RETURN * LIMIT 25"
        };
        _this._renderer = new neovis_js_1.NeoVis(_this._config);
        _this._extraProps = [];
        // this._dbService = DatabaseFactory.createDbInstance(dbConfig);
        _this._renderer.registerOnEvent("selectNode", function (nodes) {
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var node = nodes_1[_i];
                console.log(node.get("n").properties.address);
            }
        });
        _this._renderer.registerOnEvent("selectEdge", function (edges) {
            for (var _i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
                var edge = edges_1[_i];
                console.log(edge.get("r").properties);
            }
        });
        _this.refresh();
        return _this;
    }
    /**
     * Find the shortest path or evaluate the availability / quality of nodes
     * See <a href="">Path finding algorithms </a> for more details
     * @param  { PathFindingAlgorithmParam } args the remaining parameters
     */
    NeoVis.prototype.pathfinding = function (args) {
        if (readers_1.ArgumentsReader === undefined) {
            console.log("No Pathfinding Algorithm selected!");
            return;
        }
        var query;
        switch (args.algo) {
            case "none" /* None */:
            default:
                return;
            case "Minimum Weight Spanning Tree" /* MinimumWeightSpanningTree */:
                args.param.label = args.param.label || Object.keys(this._config.nodes)[0];
                args.param.relationshipType = args.param.relationshipType || Object.keys(this._config.relationships)[0];
                args.param.weightProperty = args.param.weightProperty || this._config.relationships[args.param.relationshipType].thickness || "pth_mst_weight";
                args.param.startNodeId = args.param.startNodeId || null;
                args.param.write = args.param.write || true;
                args.param.writeProperty = args.param.writeProperty || this._config.nodes[args.param.label].community;
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
            case "Shortest Path" /* ShortestPath */:
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
            case "Single Source Shortest Path" /* SingleSourceShortestPath */:
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
            case "All Pairs Shortest Path" /* AllPairsShortestPath */:
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
            case "A*" /* AStar */:
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
            case "Yen's K-shortest paths" /* KShortestPath */:
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
                args.param.maxDepth = args.param.maxDepth || neo4j_driver_1.v1.Integer.MAX_VALUE;
                args.param.writePropertyPrefix = args.param.writePropertyPrefix ? args.param.writePropertyPrefix : "PATH_";
                query = {
                    query: "CALL algo.kShortestPaths({startNode}, {endNode}, {k}, {weightProperty}, {nodeQuery: {nodeQuery}, relationshipQuery: {relationshipQuery}, direction: {direction}, defaultValue: {defaultValue}, maxDepth: {maxDepth}, write: {write}, writePropertyPrefix: {writePropertyPrefix}}) YIELD resultCount, loadMillis, evalMillis, writeMillis",
                    params: args.param
                };
                break;
            case "Random Walk" /* RandomWalk */:
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
    };
    /**
     * Determine nodes' importance using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/centrality/"> Centrality algorithms </a> for more details
     * @param {CentralityAlgorithmEnum} algo CentralityAlgorithm
     * @param  {CentralityAlgorithmParam} args the remaining parameters
     */
    NeoVis.prototype.centrality = function (algo, args) {
        if (algo === undefined) {
            console.log("No Centrality Algorithm selected!");
            return;
        }
        args.label = args.label || Object.keys(this._config.nodes)[0] || null;
        args.relationship = args.relationship || Object.keys(this._config.relationships)[0] || null;
        args.direction = args.direction || "outgoing";
        args.iterations = args.iterations || 20;
        args.dampingFactor = args.dampingFactor || 0.85;
        args.weightProperty = args.weightProperty || this._config.relationships[args.relationship].thickness || "weight";
        args.defaultValue = args.defaultValue || 0.0;
        args.write = args.write || true;
        args.graph = args.graph || "heavy";
        args.stats = args.stats || true;
        args.writeProperty = args.writeProperty || this._config.nodes[args.label].size;
        var query;
        switch (algo) {
            case "none" /* None */:
            default:
                return;
            case "PageRank" /* PageRank */:
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
            case "ArticleRank" /* ArticleRank */:
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
            case "Betweeness" /* BetweenessCentrality */:
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
            case "Closeness" /* ClosenessCentrality */:
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
            case "Harmonic" /* HarmonicCentrality */:
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
            case "Eigenvector" /* EigenvectorCentrality */:
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
            case "Degree" /* DegreeCentrality */:
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
    };
    /**
     * Detect communities using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/community/"> Community detection algorithms </a> for more details
     * @param {CommunityDetectionAlgoritmEnum} algo CommunityDetectionAlgorithm
     * @param  {CommunityDetectionParam} args the remaining parameters
     */
    NeoVis.prototype.detectCommunity = function (algo, args) {
        if (algo === undefined) {
            console.log("No CommunityDetectionAlgorithm selected!");
            return;
        }
        var query;
        args.label = args.label || Object.keys(this._config.nodes)[0] || null;
        args.relationship = args.relationship || Object.keys(this._config.relationships)[0] || null;
        args.direction = args.direction || "outgoing";
        args.iterations = args.iterations || 1;
        args.weightProperty = args.weightProperty || this._config.relationships[args.relationship].thickness || "weight";
        args.defaultValue = args.defaultValue || null;
        args.write = args.write || true;
        args.graph = args.graph || "heavy";
        args.writeProperty = args.writeProperty || this._config.nodes[args.label].community || "community";
        args.threshold = args.threshold || null;
        args.partitionProperty = args.partitionProperty || this._config.nodes[args.label].community || "community";
        args.clusteringCoefficientProperty = args.clusteringCoefficientProperty || "coefficient";
        switch (algo) {
            case "none" /* None */:
            default:
                return;
            case "Louvain" /* Louvain */:
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
            case "Label Propagation" /* LabelPropagation */:
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
            case "Connected Components" /* ConnectedComponents */:
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
            case "Strongly Connected Components" /* StronglyConnectedComponents */:
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
            case "Clustering Coefficient" /* ClusteringCoefficient */:
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
            case "Balanced Triads" /* BalancedTriads */:
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
    };
    /**
     * Tell the visualiser to render
     */
    NeoVis.prototype.refresh = function () {
        try {
            this._renderer.reload();
        }
        catch (e) {
            this._renderer.render();
        }
    };
    /**
     * Make neojs render the selected nodes returned by the cypher query
     * @param {QueryData} querydata
     * @param {number} queryLimit whether to display the outcome
     */
    NeoVis.prototype.renderWithCypher = function (querydata, queryLimit) {
        if (queryLimit === void 0) { queryLimit = 25; }
        var cypher = querydata.query;
        if (querydata.params) {
            for (var _i = 0, _a = Object.keys(querydata.params); _i < _a.length; _i++) {
                var param = _a[_i];
                var arg = querydata.params[param];
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
        var limitString = queryLimit == 0 ? "" : " LIMIT " + queryLimit;
        cypher = [cypher, this._config.initial_cypher.replace("LIMIT 25", limitString)].join("\n");
        console.log(cypher);
        this._renderer.renderWithCypher(cypher);
    };
    /**
     * Make neojs render the selected nodes returned by the cypher query
     * @param {QueryData} querydata
     * @param {number} queryLimit whether to display the outcome
     */
    NeoVis.prototype.displayWithCypher = function (querydata, queryLimit) {
        if (queryLimit === void 0) { queryLimit = 0; }
        if (!querydata.query.includes("MATCH")) {
            return;
        }
        var limitString = queryLimit == 0 ? "" : " LIMIT " + queryLimit;
        var cypher = querydata.query;
        if (querydata.params) {
            for (var _i = 0, _a = Object.keys(querydata.params); _i < _a.length; _i++) {
                var param = _a[_i];
                var arg = querydata.params[param];
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
        // console.log(cypher);
        this._renderer.renderWithCypher(cypher);
    };
    /**
     * Remove all styling elements by removing calculated properties on db nodes
     */
    NeoVis.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cypher;
            return __generator(this, function (_a) {
                cypher = "MATCH (n:Account) REMOVE " + this._extraProps.map(function (prop) { return "n." + prop; }).join(", ");
                this.displayWithCypher({ query: cypher });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Display relationships from certain node AND/OR to certain node
     * @param {string} nodeAddress
     * @param {boolean} from
     * @param {boolean} to
     */
    NeoVis.prototype.filterNodesByAddress = function (nodeAddress, from, to) {
        if (from === void 0) { from = false; }
        if (to === void 0) { to = false; }
        if (!from && !to) {
            this.focusOnNode(nodeAddress);
        }
        else {
            var cypher = "MATCH (n:Account)-[r:TRANSFER]->(m:Account) WHERE false";
            if (from) {
                cypher += " OR n.address = '" + nodeAddress + "'";
            }
            if (to) {
                cypher += " OR m.address = '" + nodeAddress + "'";
            }
            cypher += " RETURN n,r,m";
            console.log(cypher);
            this.displayWithCypher({ query: cypher }, this._queryLimit);
        }
    };
    /**
     * Filter display by dates
     * @param {string} nodeAddress per address
     * @param {Date} fromDate
     * @param {Date} toDate
     */
    NeoVis.prototype.filterNodesByDates = function (fromDate, toDate, nodeAddress) {
        if (nodeAddress === void 0) { nodeAddress = undefined; }
        if (fromDate.getTime() > toDate.getTime()) {
            throw new Error(("fromDate > toDate"));
        }
        var fDate = neo4j_driver_1.v1.types.DateTime.fromStandardDate(fromDate);
        var tDate = neo4j_driver_1.v1.types.DateTime.fromStandardDate(toDate);
        var cypher = "MATCH (n)-[r:TRANSFER]->(m) WHERE r.date >= '{fromDate}' AND r.date <= '{toDate}'";
        if (nodeAddress) {
            cypher += " AND (n.address = '" + nodeAddress + "'" + " OR m.address = '" + nodeAddress + "')";
        }
        cypher += " RETURN n,r,m";
        this.displayWithCypher({ query: cypher, params: { fromDate: fDate, toDate: tDate } }, this._queryLimit);
    };
    /**
     * See community's evolution over time
     * @param {number} fromBlock fromBlock
     * @param {number} toBlock toBlock
     * @param {number} community community id (depends on graph algorithm)
     */
    NeoVis.prototype.filterCommunityByDateRange = function (fromBlock, toBlock, community) {
        if (community === void 0) { community = undefined; }
        var cypher = "MATCH (n)-[r]->(m) WHERE datetime({epochMillis: {fromBlock}}) <= datetime(r.date) <= datetime({epochMillis: {toBlock}})";
        if (community) {
            cypher += " AND (n.community = " + community + " OR m.community = " + community + ") ";
        }
        cypher += " RETURN n,r,m";
        this.displayWithCypher({
            query: cypher,
            params: { fromBlock: fromBlock, toBlock: toBlock }
        }, this._queryLimit);
    };
    /**
     * Focus on a node of this specific address
     * @param {string} nodeAddress
     */
    NeoVis.prototype.focusOnNode = function (nodeAddress) {
        this._renderer.focusOnNode("address", nodeAddress, {
            scale: 1.0,
        });
    };
    /**
     * Change queryLimit
     * @param {number} newLimit
     */
    NeoVis.prototype.setQueryLimit = function (newLimit) {
        console.log("NeoVis module: set query limit to " + newLimit);
        this._queryLimit = newLimit;
    };
    return NeoVis;
}(Visualiser_1.Visualiser));
exports.NeoVis = NeoVis;
exports.default = NeoVis;
