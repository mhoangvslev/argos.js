import { ethers } from "ethers";
import { BlockTag } from "ethers/providers";
import { EventDescription } from "ethers/utils";
import { v1 as neo4j } from "neo4j-driver";
import { Database, DatabaseConstructor } from "../database/Database";
import { DatabaseFactory } from "../factory/DatabaseFactory";
import * as errors from "../utils/error";
import { ContractCall, DataExtractionStrategies, defaultDataProcess, FromData, Strategies, Strategy } from "../utils/strategy";
import { DatabaseConstructorType, ProviderEnum } from "../utils/types";
import { EventInfoDataStruct, ProviderConfig, Watcher } from "./Watcher";

export default class EthereumWatcher extends Watcher {
    private _contractAddr: string;
    private _dbService: Database;
    private _clearDB: boolean;
    private _config: ProviderConfig;
    private _provider: ethers.providers.BaseProvider;
    private _contract: ethers.Contract;
    private _exportDir: string;
    private _event: EventDescription;
    private _timeout: any;
    private _dbType: DatabaseConstructor;
    private _strategies: Strategies;

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

        this._contractAddr = contractAddr;
        this._dbType = dbType;
        this._dbService = undefined;
        this._clearDB = clearDB;

        this._config = providerConfig;

        this._provider = this.getProvider(providerType, providerConfig);
        this._contract = new ethers.Contract(this._contractAddr, abi, this._provider);
        this._exportDir = exportDir;

        this._event = undefined;
        this._timeout = this._config.timeout;

        console.log("Ethereum Watcher initiated!");
    }

    /**
     * Watch event with particular model
     * @param {string} eventName name of the event, usually 'Transfer'
     * @param {Neode.SchemaObject} dbModel the model loaded via require()
     * @param {number} fromDate timestamp
     * @param {number} toDate timestamp
     */
    public async watchEvents(eventName: string, fromDate?: Date, toDate?: Date) {

        this.refreshDB();

        const fromBlock: BlockTag = fromDate ? await this.timeToBlock(fromDate) : 0;
        const toBlock: BlockTag = toDate ? await this.timeToBlock(toDate) : await this._provider.getBlockNumber();

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

                    const latestInDB = await this._dbService.executeQuery({ query: "MATCH ()-[r]->() RETURN max(r.blockheight) as result" });
                    const earliestInDB = await this._dbService.executeQuery({ query: "MATCH ()-[r]->() RETURN min(r.blockheight) as result" });

                    const upperBlock = latestInDB ? parseInt(latestInDB[0].get("result")) : undefined;
                    const lowerBlock = earliestInDB ? parseInt(earliestInDB[0].get("result")) : undefined;

                    // console.log(latestInDB, earliestInDB);

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

                        if (fromBlock !== 0 && fromBlock < lowerBlock) {
                            console.log("The required fromBlock is earlier than DB's earliest block");
                            await this.getEvents(eventName, fromBlock, lowerBlock);
                        }

                        if (toBlock > upperBlock) {
                            console.log("The required toBlock is more recent than DB's latest block");
                            await this.getEvents(eventName, upperBlock, toBlock);
                        }
                    } else {
                        throw new Error(("Could not find block range..." + fromBlock + " " + toBlock));
                    }
                })
                .catch(async (reason: Error) => {
                    console.log("Cache not loaded or corrupted, updating...");
                    this._clearDB = true;
                    await this.getEvents(eventName, fromBlock, toBlock);
                });
        }

        const endTime = new Date();
        const elapsedMilli = endTime.getTime() - startTime.getTime();
        const elapsedSeconds = elapsedMilli / 1000;
        const elapsedMinutes = elapsedSeconds / 60;

        const roundMinutes = Math.trunc(elapsedMinutes);
        const roundSeconds = Math.trunc(elapsedSeconds - roundMinutes * 60);
        const roundMilis = Math.trunc(elapsedMilli - roundSeconds * 1000);

        console.log("Finished in " + roundMinutes + " mins " + roundSeconds + " s " + roundMilis + " ms");
    }

    /**
     * Convert timestimp to blocknumber
     * @param {Date} date
     */
    public async timeToBlock(date: Date): Promise<number> {
        const latestBlockNo = await this._provider.getBlockNumber();
        const upperBlock = await this._provider.getBlock(latestBlockNo);
        const lowerBlock = await this._provider.getBlock(1);
        // How many time does it take to make one block (on average) in s
        const blockTime = (upperBlock.timestamp - lowerBlock.timestamp) / (latestBlockNo - 1);
        const result = latestBlockNo - Math.floor((upperBlock.timestamp - date.getTime() / 1000) / blockTime);

        // console.log(blockTime, result);

        return result;
    }

    /**
     * Tell the Watcher to clear the database before the next operation
     * @param clearFlag
     */
    public setClearDBFlag(clearFlag: boolean) {
        this._clearDB = clearFlag;
    }

    /**
     * Assemble a selection of data out of a log part
     * @param {ethers.providers.Log[]} logPart the extracted log part
     * @returns { EventInfoDataStruct } the required information to build a db node
     */
    public async getLogData(logPart: ethers.providers.Log[]): Promise<EventInfoDataStruct[]> {
        if (logPart) {
            if (logPart.length === 0) { return []; }
            const result = await Promise.all(logPart.map((logEntry) => this.extractData(logEntry)))
                .catch(() => {
                    errors.throwError({
                        type: errors.WatcherError.ERROR_WATCHER_EXTRACT_DATA,
                        reason: "Could not call extract data properly. This mostly due to the incoherence between DB Model and PersistenceStrategy",
                        params: {
                            log: logPart,
                        }
                    });
                });
            return result || undefined;
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

        // Clear DB first if requested
        if (this._clearDB) {
            await this._dbService.dbClearAll();
        }

        const latestBlock = await this._provider.getBlockNumber();
        const tBlock: number = toBlock === "latest" ? latestBlock : (toBlock as number);
        const fBlock: number = fromBlock === "earliest" ? 0 : (fromBlock as number);

        let logs: EventInfoDataStruct[] = [];

        const self = this;

        console.log("Latest block in blockchain is #" + tBlock);

        // Start serial tasks
        let start = fBlock;
        let end = tBlock;

        let steps = 0;

        while (start !== end) {

            const startTime = new Date();

            let log = await self.getEventPatch(eventName, start, end);

            // Devide the batch by 2 until the right amount is found
            while (log === undefined) {
                if (start === end) {
                    throw new Error(("Too many events in 1 blocks!"));
                    // break;
                }

                end = start + Math.floor((end - start) / 2);
                log = await self.getEventPatch(eventName, start, end);
                steps += 1;

                const elapsedTime = new Date().getTime() - startTime.getTime();
                if (this._timeout > 0 && elapsedTime > this._timeout) {
                    throw new Error(("timeout after " + elapsedTime + " ms"));
                }
            }

            await this.sendToDB(log);

            logs = logs.concat(log);
            start = (end === tBlock) ? end : end + 1;
            end = tBlock;
            steps += 1;
        }

        console.log(logs.length + " event(s) detected!", "required " + steps + " steps");
    }

    /**
     * Load the strategies to the watcher
     * @param strategies the user-defined strategy to extract and persists data
     */
    public setStrategies(strategies: Strategies) {
        this._strategies = strategies;
    }

    /**
     * Export to CSV
     */
    private async exportCSV() {
        return this._dbService.exportCSV(this._exportDir + this._contractAddr);
    }

    /**
     * Import from CSV
     */
    private async importCSV() {
        await this._dbService.dbClearAll();
        return this._dbService.importCSV(this._contractAddr);
    }

    /**
     * Call the right provider for the contract
     * @param {ProviderEnum} providerType the provider type
     * @param {ProviderConfig} config the loaded config file
     * @returns {ethers.providers.BaseProvider} a provider
     */
    private getProvider(providerType: ProviderEnum, config: ProviderConfig): ethers.providers.BaseProvider {

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

                const urlString = (config.jsonrpc.username === "") ? config.jsonrpc.url : {
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

    /**
     * Persist processed data to the database
     * @param eidss the processed data
     */
    private async sendToDB(eidss: EventInfoDataStruct[]) {
        await this._dbService.persistDataToDB(eidss, this._strategies.PersistenceStrategy);
        await this.exportCSV();
        console.log("Database updated!");
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
        }
    }

    /**
     * Extract data from log entry
     * @param {ethers.providers.Log} logEntry a log entry
     * @returns {EventInfoDataStruct} the required information to build a db node
     */
    private async extractData(logEntry: ethers.providers.Log): Promise<EventInfoDataStruct> {
        const data = this._event.decode(logEntry.data, logEntry.topics);
        const DES: DataExtractionStrategies = this._strategies.DataExtractionStrategy;
        const nbIterations = Object.keys(DES).length;
        const eids: EventInfoDataStruct = {};

        eids.blockheight = logEntry.blockNumber;

        const block = await this._provider.getBlock(eids.blockheight);
        eids.eventTime = neo4j.types.DateTime.fromStandardDate(new Date(block.timestamp * 1000));

        // Loop through the strategies and apply each of them
        for (let i = 0; i < nbIterations; i++) {
            const strategy = Object.keys(DES[i])[1];
            let result: any;
            let s: ContractCall | FromData;

            switch (strategy) {
                case "contractCall":
                    s = (DES[i] as any)[strategy] as ContractCall;
                    const args = Object.keys(s.args).map((arg: string) => {
                        const argProcess = (s as ContractCall).args[arg];
                        return argProcess ? argProcess(data[arg]) : data[arg];
                    });
                    const r = await this.contractCall(s.funcName, args);

                    result = (r as {}) ? r[s.resAttr] : r;
                    result = await this.processData(s, result);
                    break;

                case "fromData":
                    s = (DES[i] as any)[strategy] as FromData;
                    result = data[s.attrName];
                    result = await this.processData(s, result);
                    break;

                default:
                    throw new Error("Unable to find strategy for " + DES[i]);
            }

            eids[DES[i].propName] = result;
        }

        // console.log(logEntry, data, eids);
        return eids;
    }

    /**
     * Call contract method
     * @param funcName method name
     * @param args method args
     */
    private async contractCall(funcName: string, args: any[]) {

        const contractFuncs = this._contract.functions;

        if (!Object.keys(contractFuncs).includes(funcName)) { throw new Error("This contract does not contain function " + funcName); }
        return await contractFuncs[funcName].apply(null, args)
            .catch(() => {
                errors.throwError({
                    type: errors.WatcherError.ERROR_WATCHER_CONTRACT_CALL,
                    reason: "Could not call contract function",
                    params: {
                        methodName: funcName,
                        methodArgs: args
                    }
                });
            });
    }

    /**
     * Apply process function after extracting data. By default, the data will be processed as String
     * @param strategy DES strategy
     * @param init unformatted/raw data
     */
    private async processData(strategy: Strategy, init: any) {
        const process = strategy.process || defaultDataProcess;
        const contractFuncs = this._contract.functions;
        return await process(init, contractFuncs).catch(() => {
            errors.throwError({
                type: errors.WatcherError.ERROR_WATCHER_PROCESS_DATA,
                reason: "Could not apply Process function",
                params: {
                    usingStrategy: strategy,
                    initValue: init
                }
            });
        });
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
        }).catch(() => { }); // Do nothing in case of error

        return logs ? await this.getLogData(logs) : undefined;
    }
}

export { EthereumWatcher };
