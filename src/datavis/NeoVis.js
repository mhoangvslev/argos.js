'use strict'

import { PathFindingAlgorithmEnum, CentralityAlgorithmEnum, CommunityDetectionAlgoritmEnum, Visualiser } from './Visualiser';
import { DatabaseFactory, DatabaseEnum } from '../factory/DatabaseFactory';
import { ArgumentsReader } from 'typedoc/dist/lib/utils/options/readers';
import { v1 as neo4j } from 'neo4j-driver';

const neoVis = require("../../node_modules/neovis.js/dist/neovis.js");

export default class NeoVis extends Visualiser {

    /**
     * Create a NeoVis visualiser instance from neo4j db config
     * @param {import('../../types').DatabaseConstructor} dbConfig the loaded db config file
     * @param {string} containerId the html element that holds the visualiser
     * @param {object} nodeProps NeoVis properties for labels
     * @param {object} relProps NeoVis relationship properties
     */
    constructor(dbConfig, containerId, nodeProps, relProps) {
        super();

        if (dbConfig.type != DatabaseEnum.Neo4J) {
            console.error("Only accept Neo4J database");
        }

        this._config = {
            container_id: containerId,

            server_url: dbConfig.config.bolt,
            server_user: dbConfig.config.username,
            server_password: dbConfig.config.password,

            labels: nodeProps,
            relationships: relProps,
            arrows: true,
            hierarchical: true,
            hierarchical_sort_method: "hubsize",

            initial_cypher: "MATCH (n)-[r:TRANSFER]->(m) RETURN n,r,m LIMIT 25"
        }

        this._renderer = new neoVis.default(this._config);
        this._centrality = nodeProps[Object.keys(nodeProps)].size;

        this._community = nodeProps[Object.keys(nodeProps)].community;
        this._weight = relProps[Object.keys(relProps)].thickness;
        this._extraProps = [this._community, this._centrality, this._weight];
        //this._dbService = DatabaseFactory.createDbInstance(dbConfig);

        this._selectedNodes = [];

        this._renderer.registerOnEvent('selectNode', (nodes) => {
            for (let node of nodes) {
                console.log(node.get("n").properties.address);
            }
        });

        this._renderer.registerOnEvent('selectEdge', (edges) => {
            for (let edge of edges) {
                console.log(edge.get("r").properties);
            }
        });

        this.refresh();
    }

    /**
     * Find the shortest path or evaluate the availability / quality of nodes
     * See <a href="">Path finding algorithms </a> for more details
     * @param  { import('../../types/index').argos.PathFindingAlgorithmParam } args the remaining parameters
     */
    pathfinding(args) {
        if (ArgumentsReader === undefined) {
            console.log("No Pathfinding Algorithm selected!");
            return;
        }

        let query = undefined;


        switch (args.algo) {
            case PathFindingAlgorithmEnum.None: default:
                return;

            case PathFindingAlgorithmEnum.MinimumWeightSpanningTree:
                args.param.label = args.param.label ? args.param.label : null;
                args.param.relationshipType = args.param.relationshipType ? args.param.relationshipType : null;
                args.param.weightProperty = args.param.weightProperty ? args.param.weightProperty : null;
                args.param.startNodeid = args.param.startNodeid ? args.param.startNodeid : null;
                args.param.write = args.param.write ? args.param.write : true;
                args.param.writeProperty = args.param.writeProperty ? args.param.writeProperty : null;

                query = {
                    query: "CALL algo.spanningTree({label}, {relationshipType}, {weightProperty}, {startNodeId}, {writeProperty: {writeProperty}})\nYIELD loadMillis, computeMillis, writeMillis, effectiveNodeCount",
                    param: args.param
                }
                break;

            case PathFindingAlgorithmEnum.ShortestPath:
                args.param.startNode = args.param.startNode ? args.param.startNode : null;
                args.param.endNode = args.param.endNode ? args.param.endNode : null;
                args.param.weightProperty = args.param.weightProperty ? args.param.weightProperty : null;
                args.param.defaultValue = args.param.defaultValue ? args.param.defaultValue : null;
                args.param.write = args.param.write ? args.param.write : true;
                args.param.writeProperty = args.param.writeProperty ? args.param.writeProperty : 'sssp';
                args.param.nodeQuery = args.param.nodeQuery ? args.param.nodeQuery : null;
                args.param.relationshipQuery = args.param.relationshipQuery ? args.param.relationshipQuery : null;
                args.param.direction = args.param.direction ? args.param.direction : 'outgoing';

                query = {
                    query: "CALL algo.shortestPath({startNode}, {endNode}, {weightProperty}, {nodeQuery: {nodeQuery}, relationshipQuery: {relationshipQuery}, defaultValue: {defaultValue}, write: {write}, writeProperty: {writeProperty}, direction: {direction}}) YIELD nodeCount, totalCost, loadMillis, evalMillis, writeMillis",
                    param: args.param
                }
                break;

            case PathFindingAlgorithmEnum.SingleSourceShortestPath:
                args.param.startNode = args.param.startNode ? args.param.startNode : null;
                args.param.weightProperty = args.param.weightProperty ? args.param.weightProperty : null;
                args.param.delta = args.param.delta ? args.param.delta : null;
                args.param.write = args.param.write ? args.param.write : true;
                args.param.writeProperty = args.param.writeProperty ? args.param.writeProperty : 'sssp';
                args.param.nodeQuery = args.param.nodeQuery ? args.param.nodeQuery : null;
                args.param.relationshipQuery = args.param.relationshipQuery ? args.param.relationshipQuery : null;
                args.param.direction = args.param.direction ? args.param.direction : 'outgoing';

                query = {
                    query: "CALL algo.shortestPath.deltaStepping({startNode}, {weightProperty}, {delta}, {defaultValue: {defaultValue}, write: {write}, writeProperty: {writeProperty}}) YIELD nodeCount, loadDuration, evalDuration, writeDuration",
                    param: args.param
                }
                break;

            case PathFindingAlgorithmEnum.AllPairsShortestPath:
                args.param.weightProperty = args.param.weightProperty ? args.param.weightProperty : null;
                args.param.nodeQuery = args.param.nodeQuery ? args.param.nodeQuery : null;
                args.param.relationshipQuery = args.param.relationshipQuery ? args.param.relationshipQuery : null;
                args.param.defaultValue = args.param.defaultValue ? args.param.defaultValue : null;

                query = {
                    query: "CALL algo.allShortestPaths.stream({weightProperty}, {nodeQuery: {nodeQuery}, relationshipQuery: {relationshipQuery}, defaultValue: {defaultValue}}) YIELD sourceNodeId, targetNodeId, distance",
                    param: args.param
                }

                break;

            case PathFindingAlgorithmEnum.AStar:
                args.param.startNode = args.param.startNode ? args.param.startNode : null;
                args.param.endNode = args.param.endNode ? args.param.endNode : null;
                args.param.weightProperty = args.param.weightProperty ? args.param.weightProperty : null;
                args.param.defaultValue = args.param.defaultValue ? args.param.defaultValue : null;
                args.param.propertyKeyLat = args.param.propertyKeyLat ? args.param.propertyKeyLat : null;
                args.param.propertyKeyLon = args.param.propertyKeyLon ? args.param.propertyKeyLon : null;
                args.param.nodeQuery = args.param.nodeQuery ? args.param.nodeQuery : null;
                args.param.relationshipQuery = args.param.relationshipQuery ? args.param.relationshipQuery : null;
                args.param.direction = args.param.direction ? args.param.direction : 'outgoing';

                query = {
                    query: "CALL algo.shortestPath.astar.stream(({startNode}, {endNode}, {weightProperty}, {propertyKeyLat}, {propertyKeyLon}, {nodeQuery: {nodeQuery}, relationshipQuery: {relationshipQuery}, direction: {direction}, defaultValue: {defaultValue}}) YIELD nodeId, cost",
                    param: args.param
                }

                break;

            case PathFindingAlgorithmEnum.KShortestPath:
                args.param.startNode = args.param.startNode ? args.param.startNode : null;
                args.param.endNode = args.param.endNode ? args.param.endNode : null;
                args.param.k = args.param.k ? args.param.k : null;
                args.param.weightProperty = args.param.weightProperty ? args.param.weightProperty : null;
                args.param.defaultValue = args.param.defaultValue ? args.param.defaultValue : null;
                args.param.write = args.param.write ? args.param.write : true;
                args.param.writeProperty = args.param.writeProperty ? args.param.writeProperty : 'sssp';
                args.param.nodeQuery = args.param.nodeQuery ? args.param.nodeQuery : null;
                args.param.relationshipQuery = args.param.relationshipQuery ? args.param.relationshipQuery : null;
                args.param.direction = args.param.direction ? args.param.direction : 'outgoing';
                args.param.maxDepth = args.param.maxDepth ? args.param.maxDepth : neo4j.Integer.MAX_VALUE;
                args.param.writePropertyPrefix = args.param.writePropertyPrefix ? args.param.writePropertyPrefix : 'PATH_';

                query = {
                    query: "CALL algo.kShortestPaths({startNode}, {endNode}, {k}, {weightProperty}, {nodeQuery: {nodeQuery}, relationshipQuery: {relationshipQuery}, direction: {direction}, defaultValue: {defaultValue}, maxDepth: {maxDepth}, write: {write}, writePropertyPrefix: {writePropertyPrefix}}) YIELD resultCount, loadMillis, evalMillis, writeMillis",
                    param: args.param
                }
                break;

            case PathFindingAlgorithmEnum.RandomWalk:
                args.param.start = args.param.start ? args.param.start : null;
                args.param.steps = args.param.steps ? args.param.steps : 10;
                args.param.walks = args.param.walks ? args.param.walks : 1;
                args.param.graph = args.param.graph ? args.param.graph : 'heavy';
                args.param.nodeQuery = args.param.nodeQuery ? args.param.nodeQuery : null;
                args.param.relationshipQuery = args.param.relationshipQuery ? args.param.relationshipQuery : null;
                args.param.direction = args.param.direction ? args.param.direction : 'both';
                args.param.mode = args.param.mode ? args.param.mode : 'random';
                args.param.inOut = args.param.inOut ? args.param.inOut : 1.0;
                args.param.return = args.param.return ? args.param.return : 1.0;
                args.param.path = args.param.path ? args.param.path : false;

                query = {
                    query: "CALL algo.randomWalk.stream({start}, {steps}, {walks}, {graph: {graph}, nodeQuery: {nodeQuery}, relationshipQuery: {relationshipQuery}, direction: {direction}, mode: {mode}, inOut: {inOut}, return: {return}, path: {path}}) YIELD nodes, path",
                    param: args.param
                }
                break;
        }

        console.log(query);
        this.renderWithCypher(query);
    }

    /**
     * Determine nodes' importance using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/centrality/"> Centrality algorithms </a> for more details
     * @param {import('../../types/visualiser/Visualiser').CentralityAlgorithmEnum} algo CentralityAlgorithm 
     * @param  {import('../../types/visualiser/NeoVis').CentralityAlgorithmParam} args the remaining parameters
     */
    centrality(algo, args) {

        if (algo === undefined) {
            console.log("No Centrality Algorithm selected!");
            return;
        }

        args.label = args.label ? args.label : null;
        args.relationship = args.relationship ? args.relationship : null;
        args.direction = args.direction ? args.direction : 'OUTGOING';
        args.iterations = args.iterations ? args.iterations : 20;
        args.dampingFactor = args.dampingFactor ? args.dampingFactor : 0.85;
        args.weightProperty = args.weightProperty ? args.weightProperty : 'weight';
        args.defaultValue = args.defaultValue ? args.defaultValue : 0.0;
        args.write = args.write ? args.write : true;
        args.graph = args.graph ? args.graph : 'heavy';
        args.stats = args.stats ? args.stats : true;
        args.writeProperty = args.writeProperty ? args.writeProperty : this._centrality;

        let query = undefined;
        switch (algo) {
            case CentralityAlgorithmEnum.None: default:
                return;

            case CentralityAlgorithmEnum.PageRank:
                args.writeProperty = args.writeProperty ? args.writeProperty : 'pagerank';

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
                }
                break;

            case CentralityAlgorithmEnum.ArticleRank:

                args.writeProperty = args.writeProperty ? args.writeProperty : 'pagerank';

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
                }
                break;

            case CentralityAlgorithmEnum.BetweenessCentrality:

                args.writeProperty = args.writeProperty ? args.writeProperty : 'centrality';

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
                }
                break;

            case CentralityAlgorithmEnum.ClosenessCentrality:

                args.writeProperty = args.writeProperty ? args.writeProperty : 'centrality';

                query = {
                    query: "CALL algo.closeness({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}, graph: {graph}})\nYIELD nodes, loadMillis, computeMillis, writeMillis",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty,
                        graph: args.graph
                    }
                }
                break;

            case CentralityAlgorithmEnum.HarmonicCentrality:

                args.writeProperty = args.writeProperty ? args.writeProperty : 'centrality';

                query = {
                    query: "CALL algo.closeness.harmonic({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}, graph: {graph}})\nYIELD nodes, loadMillis, computeMillis, writeMillis",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty,
                        graph: args.graph
                    }
                }
                break;

            case CentralityAlgorithmEnum.EigenvectorCentrality:

                args.writeProperty = args.writeProperty ? args.writeProperty : 'eigenvector';

                query = {
                    query: "CALL algo.eigenvector({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}})\nYIELD nodes, loadMillis, computeMillis, writeMillis, write, writeProperty",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty
                    }
                }
                break;

            case CentralityAlgorithmEnum.DegreeCentrality:

                args.writeProperty = args.writeProperty ? args.writeProperty : 'degree';

                query = {
                    query: "CALL algo.degree({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}})\nYIELD nodes, loadMillis, computeMillis, writeMillis, write, writeProperty",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty
                    }
                }
                break;
        }

        console.log(query);
        this.renderWithCypher(query);
    }

    /**
     * Detect communities using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/community/"> Community detection algorithms </a> for more details
     * @param {CommunityDetectionAlgoritmEnum} algo CommunityDetectionAlgorithm
     * @param  {import('../../types/visualiser/NeoVis').CommunityDetectionParam} args the remaining parameters
     */
    detectCommunity(algo, args) {

        if (algo === undefined) {
            console.log("No CommunityDetectionAlgorithm selected!");
            return;
        }

        let query = undefined;

        args.label = args.label ? args.label : null;
        args.relationship = args.relationship ? args.relationship : null;
        args.direction = args.direction ? args.direction : 'OUTGOING';
        args.iterations = args.iterations ? args.iterations : 1;
        args.weightProperty = args.weightProperty ? args.weightProperty : "weight";
        args.defaultValue = args.defaultValue ? args.defaultValue : null;
        args.write = args.write ? args.write : true;
        args.graph = args.graph ? args.graph : 'heavy';
        args.writeProperty = args.writeProperty ? args.writeProperty : this._community;
        args.threshold = args.threshold ? args.threshold : null;
        args.partitionProperty = args.partitionProperty ? args.partitionProperty : this._community;
        args.clusteringCoefficientProperty = args.clusteringCoefficientProperty ? args.clusteringCoefficientProperty : "coefficient"

        switch (algo) {
            case CommunityDetectionAlgoritmEnum.None: default:
                return;

            case CommunityDetectionAlgoritmEnum.Louvain:
                this._extraProps.push('unbalanced', 'balanced');

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
                }
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
                }
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
                }
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
                }
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
                }
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
                }
                break;
        }

        console.log(query);
        this.renderWithCypher(query);
    }

    /**
     * Tell the visualiser to render
     */
    refresh() {
        try {
            this._renderer.reload()
        } catch (e) {
            this._renderer.render();
        }
    }

    /**
     * Make neojs render the selected nodes returned by the cypher query
     * @param {import('../../types').QueryData} querydata 
     * @param {number} queryLimit whether to display the outcome
     */
    renderWithCypher(querydata, queryLimit = 25) {
        let cypher = querydata.query;

        if (querydata.params) {
            for (let param of Object.keys(querydata.params)) {
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

        const limitString = queryLimit == 0 ? '' : 'LIMIT ' + queryLimit;
        cypher = [cypher, this._config.initial_cypher.replace("LIMIT 25", limitString)].join("\n");
        console.log(cypher);
        this._renderer.renderWithCypher(cypher);
    }

    /**
     * Remove all styling elements by removing calculated properties on db nodes
     */
    async clear() {
        const cypher = "MATCH (n) REMOVE " + this._extraProps.map(prop => "n." + prop).join(',') + "\nWITH n";
        this.renderWithCypher({ query: cypher })
    }
}

export { NeoVis }