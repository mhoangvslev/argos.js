'use strict'

export const CommunityDetectionAlgoritmEnum = {
    Louvain: "Louvain",
    LabelPropagation: "Label Propagation",
    ConnectedComponents: "Connected Components",
    StronglyConnectedComponents: "Strongly Connected Components",
    ClusteringCoefficient: "Clustering Coefficient",
    BalancedTriads: "Balanced Triads"
}

export const CentralityAlgorithmEnum = {
    PageRank: "PageRank",
    ArticleRank: "ArticleRak",
    BetweenessCentrality: "Betweeness",
    ClosenessCentrality: "Closeness",
    HarmonicCentrality: "Harmonic",
    EigenvectorCentrality: "Eigenvector",
    DegreeCentrality: "Degree"
}

export default class Visualiser{

    /**
     * Create a watcher network
     */
    constructor() {
        console.log("Visualiser instance created!");
    }
}

export { Visualiser }