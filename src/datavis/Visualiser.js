'use strict'

export const CommunityDetectionAlgoritmEnum = {
    Louvain: "Louvain",
    LabelPropagation: "Label Propagation",
    ConnectedComponents: "Connected Components",
    StronglyConnectedComponents: "Strongly Connected Components",
    ClusteringCoefficient: "Clustering Coefficient",
    BalancedTriads: "Balanced Triads",
    None: "none"
}

export const CentralityAlgorithmEnum = {
    PageRank: "PageRank",
    ArticleRank: "ArticleRank",
    BetweenessCentrality: "Betweeness",
    ClosenessCentrality: "Closeness",
    HarmonicCentrality: "Harmonic",
    EigenvectorCentrality: "Eigenvector",
    DegreeCentrality: "Degree",
    None: "none"
}

export const PathFindingAlgorithmEnum = {
    MinimumWeightSpanningTree: "Minimum Weight Spanning Tree",
    ShortestPath: "Shortest Path",
    SingleSourceShortestPath: "Single Source Shortest Path",
    AllPairsShortestPath: "All Pairs Shortest Path",
    AStar: "A*",
    KShortestPath: "Yen's K-shortest paths",
    RandomWalk: "Random Walk",
    None: "none"
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