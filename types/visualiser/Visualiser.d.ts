import { DatabaseConstructor } from '..';

export const enum CommunityDetectionAlgoritmEnum {
    Louvain = "Louvain",
    LabelPropagation = "Label Propagation",
    ConnectedComponents = "Connected Components",
    StronglyConnectedComponents = "Strongly Connected Components",
    ClusteringCoefficient = "Clustering Coefficient",
    BalancedTriads = "Balanced Triads"
}

export const enum CentralityAlgorithmEnum {
    PageRank = "PageRank",
    ArticleRank = "ArticleRak",
    BetweenessCentrality = "Betweeness",
    ClosenessCentrality = "Closeness",
    HarmonicCentrality = "Harmonic",
    EigenvectorCentrality = "Eigenvector",
    DegreeCentrality = "Degree"
}

export declare abstract class Visualiser {

    /**
     * Create a NeoVis visualiser instance from neo4j db config
     * @param {import('../../types').DatabaseConstructor} dbConfig the loaded db config file
     * @param {string} containerId the html element that holds the visualiser
     */
    constructor(dbConfig: DatabaseConstructor, containerId: string);


    /**
     * Tell the visualiser to render
     */
    public abstract refresh(): void;
}
