import { Visualiser } from './Visualiser';
import { DatabaseConstructor } from '..';
import { CentralityAlgorithmEnum, CommunityDetectionAlgoritmEnum } from './Visualiser'

interface BaseGraphAlgorithmParam {
    label?: string;
    relationship?: string;
    weightProperty?: string;
    defaultValue?: number;
    write?: boolean;
    writeProperty?: string;
    iterations?: number;
    graph?: 'heavy' | 'cypher';
    direction?: 'in' | 'out'
}

export interface CommunityDetectionParam extends BaseGraphAlgorithmParam {
    threshold?: number;
    partitionProperty?: string;
}

export declare interface CentralityAlgorithmParam extends BaseGraphAlgorithmParam{
    dampingFactor?: number;
    stats?: boolean;
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
