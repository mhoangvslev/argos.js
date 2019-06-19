import { ethers } from "ethers";
import { Integer } from "neo4j-driver/types/v1";
import * as Neode from "neode";

type ProviderType = ethers.providers.BaseProvider;
type ContractType = ethers.Contract;
type NodeType = Neode.Node<any>;
type DatabaseConstructorType = Neo4JConstructor;

type PathFindingAlgorithmParam =
    { algo: PathFindingAlgorithmEnum.MinimumWeightSpanningTree, param: MinimumWeightSpanningTreeAlgorithmParam } |
    { algo: PathFindingAlgorithmEnum.ShortestPath, param: ShortestPathAlgorithmParam } |
    { algo: PathFindingAlgorithmEnum.SingleSourceShortestPath, param: SingleSourceShortestPathAlgorithmParam } |
    { algo: PathFindingAlgorithmEnum.AllPairsShortestPath, param: AllShortestPathAlgorithmParam } |
    { algo: PathFindingAlgorithmEnum.AStar, param: AStarAlgorithmParam } |
    { algo: PathFindingAlgorithmEnum.KShortestPath, param: KShortestPathsAlgorithmParam } |
    { algo: PathFindingAlgorithmEnum.RandomWalk, param: RandomWalkAlgorithmParam } |
    { algo: PathFindingAlgorithmEnum.None, param: any };

export const enum DatabaseEnum {
    Neo4J = 0
}

export const enum WatcherEnum {
    EthereumWatcher = 0
}

export const enum ProviderEnum {
    defaultProvider = 0,
    EtherscanProvider = 1,
    InfuraProvider = 2,
    JsonRpcProvider = 3,
    Web3Provider = 4,
    IpcProvider = 5
}

export interface QueryData {
    query: string;
    params?: { [key: string]: any };
}

export const enum CommunityDetectionAlgoritmEnum {
    Louvain = "Louvain",
    LabelPropagation = "Label Propagation",
    ConnectedComponents = "Connected Components",
    StronglyConnectedComponents = "Strongly Connected Components",
    ClusteringCoefficient = "Clustering Coefficient",
    BalancedTriads = "Balanced Triads",
    None = "none"
}

export const enum CentralityAlgorithmEnum {
    PageRank = "PageRank",
    ArticleRank = "ArticleRank",
    BetweenessCentrality = "Betweeness",
    ClosenessCentrality = "Closeness",
    HarmonicCentrality = "Harmonic",
    EigenvectorCentrality = "Eigenvector",
    DegreeCentrality = "Degree",
    None = "none"
}

export const enum PathFindingAlgorithmEnum {
    MinimumWeightSpanningTree = "Minimum Weight Spanning Tree",
    ShortestPath = "Shortest Path",
    SingleSourceShortestPath = "Single Source Shortest Path",
    AllPairsShortestPath = "All Pairs Shortest Path",
    AStar = "A*",
    KShortestPath = "Yen's K-shortest paths",
    RandomWalk = "Random Walk",
    None = "none"
}

interface BaseGraphAlgorithmParam {
    label?: string;
    relationship?: string;
    weightProperty?: string;
    write?: boolean;
    writeProperty?: string;

    defaultValue?: number;
    direction?: "incoming" | "outgoing" | "both";
}

export interface CommunityDetectionParam extends BaseGraphAlgorithmParam {
    threshold?: number;
    partitionProperty?: string;
    clusteringCoefficientProperty?: string;

    iterations?: number;
    graph?: "heavy" | "cypher";
}

export interface CentralityAlgorithmParam extends BaseGraphAlgorithmParam {
    dampingFactor?: number;
    stats?: boolean;

    iterations?: number;
    graph?: "heavy" | "cypher";
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
    direction?: "incoming" | "outgoing" | "both";
}

export interface AllShortestPathAlgorithmParam {
    weightProperty: string;
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
    direction?: "incoming" | "outgoing" | "both";
}

export interface AStarAlgorithmParam {
    startNode?: Node;
    endNode?: Node;
    weightProperty?: string;
    propertyKeyLat: string;
    propertyKeyLon: string;
    nodeQuery?: QueryData | string;
    relationshipQuery?: QueryData | string;
    defaultValue?: number;
    direction?: "incoming" | "outgoing" | "both";
}

export interface KShortestPathsAlgorithmParam extends ShortestPathAlgorithmParam {
    maxDepth?: number | Integer;
    writePropertyPrefix?: string;
    k: any;
}

export interface RandomWalkAlgorithmParam {
    start?: object;
    steps?: number;
    walks?: number;
    graph?: "heavy" | "cypher";
    k: number;
    nodeQuery: string;
    relationshipQuery: string;
    direction?: "incoming" | "outgoing" | "both";
    mode?: "random" | "node2vec";
    inOut?: number;
    return: number;
    path: boolean;
}

export interface WatcherConstructor {
    type: WatcherEnum;
    provider: ProviderEnum;
    clearDB: boolean;
    address: string;
    db: DatabaseConstructorType;
    abi: string;
    providerConf: object;
    exportDir: string;
}

export interface Neo4JConstructor extends DatabaseConstructor {
    bolt: string;
    http?: string;
    https?: string;
    enterpriseMode?: boolean;
    driverConf: object;
}

export interface DatabaseConstructor {
    username: string;
    password: string;
    model: DatabaseModels;
}

export interface DatabaseModels { [alias: string]: Neode.SchemaObject; }

export { ProviderType, ContractType, NodeType, DatabaseConstructorType, PathFindingAlgorithmParam };

export * from "./database/Database";
export * from "./database/Neo4J";
export * from "./factory/DatabaseFactory";
export * from "./factory/WatcherFactory";
export * from "./visualiser/NeoVis";
export * from "./visualiser/Visualiser";
export * from "./watcher/EthereumWatcher";
export * from "./watcher/Watcher";
