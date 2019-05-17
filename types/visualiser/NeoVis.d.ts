import { Visualiser } from './Visualiser';
import { DatabaseConstructor, QueryData, argos } from '..';
import { CentralityAlgorithmEnum, CommunityDetectionAlgoritmEnum } from './Visualiser'
import { Integer, Node } from 'neo4j-driver/types/v1';

interface BaseGraphAlgorithmParam {
    label?: string;
    relationship?: string;
    weightProperty?: string;
    write?: boolean;
    writeProperty?: string;

    defaultValue?: number;
    direction?: 'incoming' | 'outgoing' | 'both';
}

export interface CommunityDetectionParam extends BaseGraphAlgorithmParam {
    threshold?: number;
    partitionProperty?: string;
    clusteringCoefficientProperty?: string;

    iterations?: number;
    graph?: 'heavy' | 'cypher';
}

export interface CentralityAlgorithmParam extends BaseGraphAlgorithmParam {
    dampingFactor?: number;
    stats?: boolean;

    iterations?: number;
    graph?: 'heavy' | 'cypher';
}

export interface MinimumWeightSpanningTreeAlgorithmParam {
    label?: string;
    relationshipType?: string;
    weightProperty?: string;
    startNodeId?: number;
    write?: boolean;
    writeProperty?: string;
}

export interface ShortestPathAlgorithmParam {
    startNode?: Node;
    endNode?: Node;
    weightProperty?: string;
    defaultValue?: number;
    write?: boolean;
    writeProperty?: string;
    nodeQuery?: QueryData | string;
    relationshipQuery?: QueryData | string;
    direction?: 'incoming' | 'outgoing' | 'both';
}

export interface AllShortestPathAlgorithmParam {
    nodeQuery?: string;
    relationshipQuery?: string;
    defaultValue?: number;
}

export interface SingleSourceShortestPathAlgorithmParam {
    startNode?: Node;
    delta?: number;
    weightProperty?: string;
    defaultValue?: number;
    write?: boolean;
    writeProperty?: string;
    nodeQuery?: QueryData | string;
    relationshipQuery?: QueryData | string;
    direction?: 'incoming' | 'outgoing' | 'both';
}

export interface AStarAlgorithmParam {
    startNode?: Node;
    endNode?: Node;
    weightProprety?: string;
    propertyKeyLat: string;
    propertyKeyLon: string;
    nodeQuery?: QueryData | string;
    relationshipQuery?: QueryData | string;
    defaultValue?: number;
    direction?: 'incoming' | 'outgoing' | 'both';
}

export interface KShortestPathsAlgorithmParam extends ShortestPathAlgorithmParam {
    maxDepth?: number;
    writePropertyPrefix?: string;
}

export interface RandomWalkAlgorithmParam {
    start?: object;
    steps?: number;
    walks?: number;
    graph?: 'heavy' | 'cypher';
    k: number;
    nodeQuery: string;
    relationshipQuery: string;
    direction?: 'incoming' | 'outgoing' | 'both';
    mode?: 'random' | 'node2vec';
    inOut?: number;
    return: number;
    path: boolean;
}

export declare class NeoVis extends Visualiser {

    /**
     * Create a NeoVis visualiser instance from neo4j db config
     * @param {DatabaseConstructor} dbConfig the loaded db config file
     * @param {string} containerId the html element that holds the visualiser
     * @param {object} nodeProps NeoVis properties for labels
     * @param {object} relProps NeoVis relationship properties
     */
    constructor(dbConfig: DatabaseConstructor, containerId: string, nodeProps: object, relProps: object);

    /**
     * Find the shortest path or evaluate the availability / quality of nodes
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/pathfinding/">Path finding algorithms </a> for more details
     * @param  { argos.PathFindingAlgorithmParam } args the remaining parameters
     */
    public pathfinding(args: argos.PathFindingAlgorithmParam): void;

    /**
     * Determine nodes' importance using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/centrality/"> Centrality algorithms </a> for more details
     * @param {CentralityAlgorithmEnum} algo CentralityAlgorithm 
     * @param  {CentralityAlgorithmParam} args the remaining parameters
     */
    public centrality(algo: CentralityAlgorithmEnum, args: CentralityAlgorithmParam): void;

    /**
     * Detect communities using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/community/"> Community detection algorithms </a> for more details
     * @param {CommunityDetectionAlgoritmEnum} algo CommunityDetectionAlgorithm
     * @param  {CommunityDetectionParam} args the remaining parameters
     */
    public detectCommunity(algo: CommunityDetectionAlgoritmEnum, args: CommunityDetectionParam): void

    /**
     * Tell the visualiser to render
     */
    public refresh(): void;

    /**
     * Remove all styling elements by removing calculated properties on db nodes
     */
    public clear(): void;
}
