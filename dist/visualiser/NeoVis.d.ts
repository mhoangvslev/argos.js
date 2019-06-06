import { Visualiser } from "./Visualiser";
import { NeoVis as NeoViz, NeoVisConfig } from "neovis.js";
import { CentralityAlgorithmEnum, CentralityAlgorithmParam, CommunityDetectionAlgoritmEnum, CommunityDetectionParam, Neo4JConstructor, PathFindingAlgorithmParam, QueryData } from "..";
export default class NeoVis extends Visualiser {
    _renderer: NeoViz;
    _extraProps: string[];
    _queryLimit: number;
    _config: NeoVisConfig;
    /**
     * Create a NeoVis visualiser instance from neo4j db config
     * @param {Neo4JConstructor} dbConfig the loaded db config file
     * @param {string} containerId the html element that holds the visualiser
     * @param {NeovisConfig} neovis NeoVis properties
     */
    constructor(dbConfig: Neo4JConstructor, containerId: string, neovis: NeoVisConfig);
    /**
     * Find the shortest path or evaluate the availability / quality of nodes
     * See <a href="">Path finding algorithms </a> for more details
     * @param  { PathFindingAlgorithmParam } args the remaining parameters
     */
    pathfinding(args: PathFindingAlgorithmParam): void;
    /**
     * Determine nodes' importance using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/centrality/"> Centrality algorithms </a> for more details
     * @param {CentralityAlgorithmEnum} algo CentralityAlgorithm
     * @param  {CentralityAlgorithmParam} args the remaining parameters
     */
    centrality(algo: CentralityAlgorithmEnum, args: CentralityAlgorithmParam): void;
    /**
     * Detect communities using a selected algorithm
     * See <a href="https://neo4j.com/docs/graph-algorithms/current/algorithms/community/"> Community detection algorithms </a> for more details
     * @param {CommunityDetectionAlgoritmEnum} algo CommunityDetectionAlgorithm
     * @param  {CommunityDetectionParam} args the remaining parameters
     */
    detectCommunity(algo: CommunityDetectionAlgoritmEnum, args: CommunityDetectionParam): void;
    /**
     * Tell the visualiser to render
     */
    refresh(): void;
    /**
     * Make neojs render the selected nodes returned by the cypher query
     * @param {QueryData} querydata
     * @param {number} queryLimit whether to display the outcome
     */
    renderWithCypher(querydata: QueryData, queryLimit?: number): void;
    /**
     * Make neojs render the selected nodes returned by the cypher query
     * @param {QueryData} querydata
     * @param {number} queryLimit whether to display the outcome
     */
    displayWithCypher(querydata: QueryData, queryLimit?: number): void;
    /**
     * Remove all styling elements by removing calculated properties on db nodes
     */
    clear(): Promise<void>;
    /**
     * Display relationships from certain node AND/OR to certain node
     * @param {string} nodeAddress
     * @param {boolean} from
     * @param {boolean} to
     */
    filterNodesByAddress(nodeAddress: string, from?: boolean, to?: boolean): void;
    /**
     * Filter display by dates
     * @param {string} nodeAddress per address
     * @param {Date} fromDate
     * @param {Date} toDate
     */
    filterNodesByDates(fromDate: Date, toDate: Date, nodeAddress?: string): void;
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
    focusOnNode(nodeAddress: string): void;
    /**
     * Change queryLimit
     * @param {number} newLimit
     */
    setQueryLimit(newLimit: number): void;
}
export { NeoVis };
