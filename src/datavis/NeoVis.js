'use strict'

import Neode from 'neode';
import { CentralityAlgorithmEnum, CommunityDetectionAlgoritmEnum, Visualiser } from './Visualiser';
import { DatabaseFactory, DatabaseEnum } from '../factory/DatabaseFactory';

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

        var conf = {
            container_id: containerId,

            server_url: dbConfig.config.bolt,
            server_user: dbConfig.config.username,
            server_password: dbConfig.config.password,

            labels: nodeProps,
            relationships: relProps,

            initial_cypher: "MATCH (n)-[r:TRANSFER]->(m) RETURN n,r,m"
        }

        this._renderer = new neoVis.default(conf);
        this._dbService = DatabaseFactory.createDbInstance(dbConfig);
        this._centrality = undefined;
        this._community = undefined;
    }

    /**
     * Determine nodes' importance using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/centrality/"> Centrality algorithms </a> for more details
     * @param {import('../../types/visualiser/Visualiser').CentralityAlgorithmEnum} algo CentralityAlgorithm 
     * @param  {import('../../types/visualiser/NeoVis').CentralityAlgorithmParam} args the remaining parameters
     */
    async centrality(algo, args) {

        if (algo === undefined) {
            console.log("No Centrality Algorithm selected!");
            return;
        }

        args.label = args.label ? args.label : null;
        args.relationship = args.relationship ? args.relationship : null;
        args.direction = args.direction ? args.direction : 'OUTGOING';
        args.iterations = args.iterations ? args.iterations : 20;
        args.dampingFactor = args.dampingFactor ? args.dampingFactor : 0.85;
        args.weightProperty = args.weightProperty ? args.weightProperty : null;
        args.defaultValue = args.defaultValue ? args.defaultValue : 0.0;
        args.write = args.write ? args.write : true;
        args.graph = args.graph ? args.graph : 'heavy';
        args.stats = args.stats ? args.stats : true;


        let query = undefined;
        switch (algo) {
            case CentralityAlgorithmEnum.PageRank: default:
                args.writeProperty = args.writeProperty ? args.writeProperty : 'pagerank';

                query = {
                    query: "CALL algo.pageRank({label}, {relationship}, {direction: {direction}, iterations: {iterations}, dampingFactor: {dampingFactor}, write: {write}, writeProperty: {writeProperty}})",
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
                    query: "CALL algo.pageRank({label}, {relationship}, {iterations: {iterations}, dampingFactor: {dampingFactor}, write: {write}, writeProperty: {writeProperty}})",
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
                    query: "CALL algo.betweenness({label}, {relationship}, {direction: {direction}, write: {write}, stats: {stats}, writeProperty: {writeProperty}})",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        direction: direction,
                        write: args.write,
                        stats: stats,
                        writeProperty: args.writeProperty
                    }
                }
                break;

            case CentralityAlgorithmEnum.ClosenessCentrality:

                args.writeProperty = args.writeProperty ? args.writeProperty : 'centrality';

                query = {
                    query: "CALL algo.closeness({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}, graph: {graph}})",
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
                    query: "CALL algo.harmonic({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}, graph: {graph}})",
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
                    query: "CALL algo.eigenvector({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}})",
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
                    query: "CALL algo.degree({label}, {relationship}, {write: {write}, writeProperty: {writeProperty}})",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        write: args.write,
                        writeProperty: args.writeProperty
                    }
                }
                break;
        }

        this._centrality = args.writeProperty;
        console.log(query);
        await this._dbService.executeQuery(query).catch((reason) => { console.error(reason) });
    }

    /**
     * Detect communities using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/community/"> Community detection algorithms </a> for more details
     * @param {CommunityDetectionAlgoritmEnum} algo CommunityDetectionAlgorithm
     * @param  {import('../../types/visualiser/NeoVis').CommunityDetectionParam} args the remaining parameters
     */
    async detectCommunity(algo, args) {

        if (algo === undefined) {
            console.log("No CommunityDetectionAlgorithm selected!");
            return;
        }

        let query = undefined;

        args.label = args.label ? args.label : null;
        args.relationship = args.relationship ? args.relationship : null;
        args.direction = args.direction ? args.direction : 'OUTGOING';
        args.iterations = args.iterations ? args.iterations : 1;
        args.weightProperty = args.weightProperty ? args.weightProperty : null;
        args.defaultValue = args.defaultValue ? args.defaultValue : 0.0;
        args.write = args.write ? args.write : true;
        args.graph = args.graph ? args.graph : 'heavy';
        args.writeProperty = args.writeProperty ? args.writeProperty : 'community';
        args.threshold = args.threshold ? args.threshold : null;
        args.partitionProperty = args.partitionProperty ? args.partitionProperty : 'community';

        switch (algo) {
            case CommunityDetectionAlgoritmEnum.Louvain:
                query = {
                    query: "CALL algo.louvain({label}, {relationship}, { weightProperty: {weightProperty}, defaultValue: {defaultValue}, write: {write}, writeProperty: {writeProperty} })",
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

            case CommunityDetectionAlgoritmEnum.LabelPropagation: default:
                query = {
                    query: "CALL algo.labelPropagation({label}, {relationship}, {iterations:1, weightProperty: {weightProperty}, writeProperty: {writeProperty}, write: {write}})",
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
                    query: "CALL algo.unionFind({label}, {relationship}, {threshold:{threshold}, defaultValue:{defaultValue}, write: {write}, writeProperty: {writeProperty}, weightProperty: {weightProperty}, graph:{graph})",
                    params: {
                        label: args.label,
                        relationship: args.relationship,
                        threshold: args.threshold,
                        weightProperty: args.weightProperty,
                        write: args.write,
                        writeProperty: args.writeProperty,
                        graph: args.graph
                    }
                }
                break;

            case CommunityDetectionAlgoritmEnum.StronglyConnectedComponents:
                query = {
                    query: "CALL algo.scc({label}, {relationship}, {write: {write},writeProperty: {writeProperty}, graph: {graph}})",
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
                    query: "CALL algo.triangle.stream({label}, {relationship})",
                    params: {
                        label: args.label,
                        relationship: args.relationship
                    }
                }
                break;

            case CommunityDetectionAlgoritmEnum.BalancedTriads:
                query = {
                    query: "CALL algo.balancedTriads.stream({label}, {relationship})",
                    params: {
                        label: args.label,
                        relationship: args.relationship
                    }
                }
                break;
        }

        console.log(query);
        this._community = args.writeProperty;
        await this._dbService.executeQuery(query).catch((reason) => { console.error(reason) });
    }

    /**
     * Tell the visualiser to render
     */
    refresh() {
        this._renderer.render();
    }

    /**
     * Remove all styling elements by removing calculated properties on db nodes
     */
    async clear() {
        await this._dbService.executeQuery({
            query: "MATCH (n) REMOVE n." + this._centrality + ", n." + this._community
        })
    }
}

export { NeoVis }