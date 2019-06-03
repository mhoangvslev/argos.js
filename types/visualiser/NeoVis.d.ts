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
     * @param {object} neovis NeoVis properties 
     */
    constructor(dbConfig: DatabaseConstructor, containerId: string, neovis: object);

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
     * Make neojs render the selected nodes returned by the cypher query
     * @param {QueryData} querydata 
     * @param {number} displayResult whether to display the outcome
     */
    public renderWithCypher(querydata: QueryData, displayResult: number): void;

    /**
     * Make neojs render the selected nodes returned by the cypher query
     * @param {QueryData} querydata 
     * @param {number} queryLimit whether to display the outcome
     */
    public displayWithCypher(querydata: QueryData, queryLimit: number): void;

    /**
     * Display relationships from certain node AND/OR to certain node
     * @param {string} nodeAddress address to filter
     * @param {boolean} from display relationships from that node
     * @param {boolean} to display relationships to that node
     */
    public filterNodesByAddress(nodeAddress: string, from?: boolean, to?: boolean): void;

    /**
     * Filter display by dates
     * @param {string} nodeAddress per address
     * @param {Date} fromDate 
     * @param {Date} toDate 
     */
    public filterNodesByDates(fromDate: Date, toDate: Date, nodeAddress?: string): void;

    /**
     * See community's evolution over time
     * @param {number} fromBlock fromBlock
     * @param {number} toBlock toBlock
     * @param {number} community community id (depends on graph algorithm)
     */
    filterCommunityByDateRange(fromBlock: number, toBlock: number, community?: number): void;

    /**
     * Focus on a node of this specific address
     * @param {string} nodeAddress 
     */
    public focusOnNode(nodeAddress: string): void;

    /**
     * Remove all styling elements by removing calculated properties on db nodes
     */
    public clear(): void;

    /**
     * Change queryLimit
     * @param {number} newLimit 
     */
    setQueryLimit(newLimit: number): void;
}
