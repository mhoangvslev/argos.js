import { ethers } from "ethers";
import { BlockTag } from "ethers/providers";
import { Networkish } from "ethers/utils";
import { v1 as neo4j } from "neo4j-driver";
import { DatabaseConstructorType, Neo4JConstructor, ProviderEnum, QueryData } from "..";
import { Database } from "../database/Database";
import { DatabaseFactory } from "../factory/DatabaseFactory";
import { EventInfoDataStruct, Watcher } from "./Watcher";

export interface ProviderConfig {
    timeout?: number;
    infura?: {
        network?: Networkish,
        projectId?: string
    };
    etherscan?: {
        network?: Networkish,
        api?: string
    };
    jsonrpc?: {
        network: Networkish
        url?: string,
        username?: string,
        password?: string,
        allowInsecure?: boolean
    };
    web3?: {
        host?: string
    };
    ipc?: {
        path?: string;
        network?: Networkish;
    };
}

export default class EthereumWatcher extends Watcher {
    public _contractAddr: string;
    public _dbService: Database;
    public _clearDB: boolean;
    public _config: ProviderConfig;
    public _provider: ethers.providers.BaseProvider;
    public _contract: ethers.Contract;
    public _exportDir: string;
    public _infos: Map<any, any>;
    public _event: any;
    public _timeout: any;
    public _dbType: Neo4JConstructor;

    /**
     * Create a watcher for Ethereum blockchain
     * @param {string} contractAddr the address of the verified contract
     * @param {string} abi the ABI of the verified contract
     * @param {number} providerType the Etherscan API Token
     * @param {DatabaseConstructorType} dbType the database servcice constructor
     * @param {ProviderConfig} providerConfig the loaded config file
     * @param {boolean} clearDB retrieve from genesis block instead of the latest in DB (db cleared)
     * @param {string} exportDir export dir
     * @returns {EthereumWatcher} Ethereum instance
     */
    constructor(contractAddr: string, abi: string, providerType: number, dbType: DatabaseConstructorType, providerConfig: ProviderConfig, clearDB: boolean, exportDir: string) {
        super();

        /**
         * Call the right provider for the contract
         * @param {ProviderEnum} providerType the provider type
         * @param {ProviderConfig} config the loaded config file
         * @returns {ethers.providers.BaseProvider} a provider
         */
        function getProvider(providerType: ProviderEnum, config: ProviderConfig): ethers.providers.BaseProvider {

            switch (providerType) {
                case ProviderEnum.defaultProvider: default:
                    return ethers.getDefaultProvider();

                case ProviderEnum.EtherscanProvider:
                    return new ethers.providers.EtherscanProvider(ethers.utils.getNetwork(config.etherscan.network), config.etherscan.api);

                case ProviderEnum.InfuraProvider:
                    console.log("Infura");
                    return new ethers.providers.InfuraProvider(ethers.utils.getNetwork(config.infura.network), config.infura.projectId);

                case ProviderEnum.JsonRpcProvider:
                    console.log("JSON-RPC");

                    const urlString = (config.jsonrpc.username == "") ? config.jsonrpc.url : {
                        url: config.jsonrpc.url,
                        user: config.jsonrpc.username,
                        password: config.jsonrpc.password,
                        allowInsecure: config.jsonrpc.allowInsecure
                    };

                    return new ethers.providers.JsonRpcProvider(urlString, ethers.utils.getNetwork(config.jsonrpc.network));

                case ProviderEnum.Web3Provider:
                    return new ethers.providers.Web3Provider(
                        { host: config.web3.host }
                    );

                case ProviderEnum.IpcProvider:
                    return new ethers.providers.IpcProvider(config.ipc.path, ethers.utils.getNetwork(config.ipc.network));

            }
        }

        this._contractAddr = contractAddr;
        this._dbType = dbType;
        this._dbService = undefined;
        this._clearDB = clearDB;

        this._config = providerConfig;

        this._provider = getProvider(providerType, providerConfig);
        this._contract = new ethers.Contract(this._contractAddr, abi, this._provider);
        this._exportDir = exportDir;

        this._infos = new Map();
        this._event = undefined;
        this._timeout = this._config.timeout;

        this.initOnce().then(() => { console.log("Ethereum Watcher initiated!"); });
    }

    /**
     * Watch event with particular model
     * @param {string} eventName name of the event, usually 'Transfer'
     * @param {Neode.SchemaObject} dbModel the model loaded via require()
     * @param {number} fromDate timestamp
     * @param {number} toDate timestamp
     */
    public async watchEvents(eventName: string, fromDate: Date = undefined, toDate: Date = undefined) {

        const fromBlock = fromDate ? await this.timeToBlock(fromDate) : 0;
        const toBlock = toDate ? await this.timeToBlock(toDate) : await this._provider.getBlockNumber();

        this._event = this._contract.interface.events[eventName];

        console.log("Start logging " + eventName + " events");
        const startTime = new Date();

        // Import CSV, if unsucess, build from scratch
        if (this._clearDB) {
            console.log("Update cache...");
            await this.getEvents(eventName, fromBlock, toBlock);
        } else {
            console.log("Reload from cache...");
            await this.importCSV()
                .then(async () => {
                    console.log("Cached reloaded, updating...");
                    this._clearDB = false;
                    // Setup
                    const latestInDB = await this._dbService.executeQuery({ query: "MATCH ()-[r:TRANSFER]->() RETURN max(r.blockheight) as result" });
                    const earliestInDB = await this._dbService.executeQuery({ query: "MATCH ()-[r:TRANSFER]->() RETURN min(r.blockheight) as result" });

                    // console.log(earliestInDB, latestInDB);

                    this._infos.set("fromBlock", fromBlock);
                    this._infos.set("toBlock", toBlock);

                    this._infos.set("fromDate", fromDate);
                    this._infos.set("toDate", toDate);

                    const upperBlock = latestInDB ? parseInt(latestInDB[0].get("result")) : undefined;
                    const lowerBlock = earliestInDB ? parseInt(earliestInDB[0].get("result")) : undefined;

                    if (lowerBlock && upperBlock) {

                        if (fromBlock > upperBlock || toBlock < lowerBlock) {
                            console.log("The required range is outside DB's range");
                            await this.getEvents(eventName, fromBlock, toBlock);
                        }

                        if (fromBlock >= lowerBlock && toBlock <= upperBlock) {
                            console.log("The required range is inside DB's range");
                            await this.getEvents(eventName, fromBlock, toBlock);
                        }

                        // Required block englobles DB's range

                        if (fromBlock != 0 && fromBlock < lowerBlock) {
                            console.log("The required fromBlock is earlier than DB's earliest block");
                            await this.getEvents(eventName, fromBlock, lowerBlock);
                        }

                        if (toBlock > upperBlock) {
                            console.log("The required toBlock is more recent than DB's latest block");
                            await this.getEvents(eventName, upperBlock, toBlock);
                        }
                    }
                })
                .catch(async (reason) => {
                    console.log("Cache not loaded or corrupted, updating...");
                    this._clearDB = true;
                    await this.getEvents(eventName, fromBlock, toBlock);
                });
        }

        const endTime = new Date();
        const elapsedTime = endTime.getTime() - startTime.getTime();
        const elapsedSeconds = elapsedTime / 1000;
        const elapsedMinutes = elapsedSeconds / 60;
        const elapsedMilli = (elapsedSeconds - Math.floor(elapsedSeconds)) * 1000;

        console.log("Finished in " + Math.trunc(elapsedMinutes) + " mins " + Math.trunc(elapsedSeconds) + " s " + Math.round(elapsedMilli) + " ms");
    }

    /**
     * Convert timestimp to blocknumber
     * @param {Date} date
     */
    public async timeToBlock(date: Date): Promise<number> {
        const latestBlockNo = await this._provider.getBlockNumber();
        const upperBlock = await this._provider.getBlock(latestBlockNo);
        const lowerBlock = await this._provider.getBlock(1);
        const blockTime = (upperBlock.timestamp - lowerBlock.timestamp) / latestBlockNo;
        return latestBlockNo - Math.ceil((upperBlock.timestamp - date.getTime() * 1000) / blockTime);
    }

    /**
     * Export to CSV
     */
    public async exportCSV() {
        return this._dbService.executeQuery({
            query: "CALL apoc.export.csv.query({query}, {file}, {config}) YIELD file, source, format, nodes, relationships, properties, time, rows, data",
            params: {
                query: "MATCH (src:Account)-[r:TRANSFER]->(tgt:Account) RETURN r.amount AS amount, r.blockheight as blockheight, r.date as datetime , tgt.address AS receiver, src.address AS sender",
                file: this._exportDir + this._contractAddr + ".csv",
                config: null
            }
        });
    }

    /**
     * Import from CSV
     */
    public async importCSV() {
        this.refreshDB();
        await this._dbService.dbClearAll();
        const cypher = {
            query: "LOAD CSV WITH HEADERS FROM 'file:///" + this._contractAddr + ".csv' AS row\n" +
                "MERGE (src:Account {address: row.sender})\n" +
                "MERGE (tgt:Account {address: row.receiver})\n" +
                "MERGE (src)-[r:TRANSFER]->(tgt) ON CREATE SET r.amount = row.amount, r.blockheight = row.blockheight, r.date = row.datetime"
        };
        return this._dbService.executeQuery(cypher);
    }

    /**
     * Get basic information about the contract
     * @returns {Map} the object containing information
     */
    public async getInfos(): Promise<Map<string, any>> {
        return this._infos;
    }

    /**
     * Assemble a selection of data out of a log part
     * @param {ethers.providers.Log[]} logPart the extracted log part
     * @returns { EventInfoDataStruct } the required information to build a db node
     */
    public async getLogData(logPart: ethers.providers.Log[]): Promise<EventInfoDataStruct[]> {
        if (logPart) {
            if (logPart.length == 0) { return []; }
            const result = await Promise.all(logPart.map((logEntry) => this.extractData(logEntry)));
            return result ? result : undefined;
        }
        return undefined;
    }

    /**
     * Get events from provider and store data to database
     * @param {string} eventName
     * @param {number} fromBlock
     * @param {number} toBlock
     */
    public async getEvents(eventName: string, fromBlock: BlockTag, toBlock: BlockTag): Promise<void> {
        await this._getEvents(eventName, fromBlock, toBlock)
            .then(async (result) => {

                const queries: QueryData[] = [];

                result.logs.forEach((event) => {
                    queries.push({
                        query: "MERGE (src:Account {address: {sender}})\n MERGE (tgt:Account {address: {receiver}})\n MERGE (src)-[r:TRANSFER]->(tgt) ON CREATE SET r.amount = toFloat({amount}), r.blockheight = toInteger({blockheight}), r.date = {date}",
                        params: { sender: event.from, receiver: event.to, amount: event.value, blockheight: event.blockNumber, date: event.date }
                    });
                });

                // console.log(queries);
                await this._dbService.executeQueries(queries);
                await this.exportCSV();

                console.log("Database updated!");

            })
            .catch((reason) => {
                console.error("Could not retrieve " + eventName + " events", reason);
            });

    }

    private async initOnce() {
        this._infos.set("contractName", await this._contract.name());
        this._infos.set("contractDecimals", await this._contract.decimals());
        this._infos.set("totalSupply", await this._contract.totalSupply());
    }

    /**
     * Refresh the database connection, do an action then close connection
     * @param {function} callback the action to perform once the connection is interupted
     */
    private refreshDB() {
        if (this._dbService !== undefined) {
            this._dbService.dbReconnect();
        } else {
            this._dbService = DatabaseFactory.createDbInstance(this._dbType);
            this._dbService.dbCreateModel(this._dbType.model);
        }
    }

    /**
     * Get events from log
     * @param {string} eventName the event name to watch
     * @param {number} fromBlock the start block, default is 0
     * @param {number} toBlock  the ending block, default is 'lastest'
     * @returns {Promise<{logs: ethers.providers.Log[]; steps: number;}>} the graph data and the number of steps required to process the log
     */
    private async _getEvents(eventName: string, fromBlock: BlockTag, toBlock: BlockTag): Promise<{ logs: EventInfoDataStruct[]; steps: number; }> {

        function blockTagToNumber(blkTag: BlockTag): number {
            return typeof (blkTag) == "string" ? parseInt(blkTag) : blkTag;
        }

        this.refreshDB(); // Open new session

        // Clear DB first if requested
        if (this._clearDB) {
            await this._dbService.dbClearAll();
        }

        const latestBlock = await this._provider.getBlockNumber();
        const tBlock: number = toBlock === "latest" ? latestBlock : blockTagToNumber(toBlock);
        const fBlock: number = fromBlock === "earliest" ? 0 : blockTagToNumber(fromBlock);

        let logs: EventInfoDataStruct[] = [];

        const self = this;

        console.log("Latest block in blockchain is #" + tBlock);

        // Start serial tasks
        let start = fBlock;
        let end = tBlock;

        let steps = 0;

        while (start != end) {

            const startTime = new Date();

            let log = await self.getEventPatch(eventName, start, end);

            // Devide the batch by 2 until the right amount is found
            while (log === undefined) {
                if (start == end) {
                    console.error("Too many events in 1 blocks!");
                    break;
                }

                end = start + Math.floor((end - start) / 2);
                log = await self.getEventPatch(eventName, start, end);
                steps += 1;

                const elapsedTime = new Date().getTime() - startTime.getTime();
                if (elapsedTime > this._timeout) {
                    throw new Error(("timeout after " + elapsedTime + " ms"));
                }
            }

            logs = logs.concat(log);
            start = end == tBlock ? end : end + 1;
            end = tBlock;
            steps += 1;
        }

        console.log(logs.length + " event(s) detected!", "required " + steps + " steps");
        return { logs, steps };
    }

    /**
     * Extract data from log entry
     * @param {ethers.providers.Log} logEntry a log entry
     * @returns {EventInfoDataStruct} the required information to build a db node
     */
    private async extractData(logEntry: ethers.providers.Log): Promise<EventInfoDataStruct> {
        const data = this._event.decode(logEntry.data, logEntry.topics);

        const sender = data.from;
        const receiver = data.to;
        const value = data.value;

        const decimals = this._infos.get("contractDecimals");
        const displayValue = ethers.utils.formatUnits(value, decimals);

        const blockNumber = logEntry.blockNumber;
        const block = await this._provider.getBlock(blockNumber);

        const unix_timestamp = ethers.utils.bigNumberify(block.timestamp).toNumber();
        const jsDate = new Date(unix_timestamp * 1000);
        const neoDate = neo4j.types.DateTime.fromStandardDate(jsDate);

        // console.log(data);

        return {
            blockNumber: logEntry.blockNumber,
            date: neoDate,
            from: sender,
            to: receiver,
            value: displayValue
        };
    }

    /**
     * Get the smaller batch of events
     * @param {string} eventName
     * @param {number} fromBlock
     * @param {number} toBlock
     * @returns {Promise<ethers.providers.Log[]>}
     */
    private async getEventPatch(eventName: string, fromBlock: number, toBlock: number): Promise<EventInfoDataStruct[]> {
        console.log("Getting events '" + eventName + "' from block #" + fromBlock + " to block #" + toBlock);

        const logs = await this._provider.getLogs({
            fromBlock,
            toBlock,
            address: this._contractAddr,
            topics: [this._event.topic]
        }).catch(() => { });

        return logs ? await this.getLogData(logs) : undefined;
    }
}

export { EthereumWatcher };
