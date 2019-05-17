'use strict'

import { ethers } from "ethers";
import * as Neode from "neode";
import { v1 as neo4j } from 'neo4j-driver';
import Web3 from "web3";
import { ExportToCsv } from 'export-to-csv';

import { Watcher } from "./Watcher";
import DatabaseFactory from "../factory/DatabaseFactory";

var linspace = require("linspace");

export const ProviderEnum = {
    defaultProvider: 0,
    EtherscanProvider: 1,
    InfuraProvider: 2,
    JsonRpcProvider: 3,
    Web3Provider: 4,
    IpcProvider: 5
}

export default class EthereumWatcher extends Watcher {

    /**
     * Create a watcher for Ethereum blockchain
     * @param {string} contractAddr the address of the verified contract
     * @param {string} abi the ABI of the verified contract
     * @param {number} providerType the Etherscan API Token
     * @param { DatabaseConstructor } dbType the database servcice constructor
     * @param {object} providerConfig the loaded config file
     * @param {boolean} clearDB retrieve from genesis block instead of the latest in DB (db cleared)
     * @returns {EthereumWatcher} Ethereum instance
     */
    constructor(contractAddr, abi, providerType, dbType, providerConfig, clearDB) {
        super();

        /**
         * Call the right provider for the contract
         * @param {ProviderEnum} providerType the provider type
         * @param {object} config the loaded config file
         * @returns {ethers.providers.BaseProvider} a provider
         */
        function getProvider(providerType, config) {

            switch (providerType) {
                case ProviderEnum.defaulProvider: default:
                    return new ethers.getDefaultProvider();

                case ProviderEnum.EtherscanProvider:
                    return new ethers.providers.EtherscanProvider(ethers.utils.getNetwork(config.etherscan.network), config.etherscan.api);

                case ProviderEnum.InfuraProvider:
                    return new ethers.providers.InfuraProvider(ethers.utils.getNetwork(config.infura.network), config.infura.projectId);

                case ProviderEnum.JsonRpcProvider:
                    return new ethers.providers.JsonRpcProvider({
                        url: config.jsonrpc.url,
                        user: config.jsonrpc.user,
                        password: config.jsonrpc.password,
                        allowInsecure: config.jsonrpc.allowInsecure
                    }, ethers.utils.getNetwork(config.jsonrpc.network));

                case ProviderEnum.Web3Provider:
                    return new ethers.providers.Web3Provider(
                        new Web3.providers.HttpProvider(config.web3.host)
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
    }

    /**
     * Refresh the database connection, do an action then close connection
     * @param {function} callback the action to perform once the connection is interupted
     */
    refreshDB() {
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
     * @param {string | number} fromBlock the start block, default is 0
     * @param {string | number} toBlock  the ending block, default is 'lastest'
     * @returns {Promise<{logs: import("../../types").EventInfoDataStruct[]; steps: number;}>} the graph data and the number of steps required to process the log 
     */
    async getEvents(eventName, fromBlock = 0, toBlock = 'latest') {

        this.refreshDB();

        function toInt(number) {
            return typeof number == "string" ? parseInt(number) : Math.round(number);
        }

        if (this._clearDB) {
            await this._dbService.dbClearAll();
        }

        const latestInDB = await this._dbService.executeQuery({
            query: 'MATCH (n) WHERE EXISTS(n.blockheight) RETURN DISTINCT "node" as entity, n.blockheight AS blockheight UNION ALL MATCH ()-[r]-() WHERE EXISTS(r.blockheight) RETURN DISTINCT "relationship" AS entity, r.blockheight AS blockheight ORDER BY r.blockheight DESC LIMIT 1'
        });

        const fBlock = toInt(
            (this._clearDB || latestInDB === undefined || latestInDB.length == 0) ? (fromBlock == 'earliest' ? 0 : fromBlock) : latestInDB[0].get("blockheight")
        );

        const latestBlock = await this._provider.getBlockNumber();
        const tBlock = toInt(toBlock == 'latest' ? latestBlock : toBlock);

        const provider = this._provider;
        const address = this._contractAddr;
        const contract = this._contract;

        let logs = [];
        let event = this._contract.interface.events[eventName];

        console.log("Latest block in blockchain is #" + tBlock)


        /**
         * Get the smaller batch of events
         * @param {ethers.providers.BaseProvider} provider 
         * @param {string} address 
         * @param {number} fromBlock 
         * @param {number} toBlock 
         * @returns {Promise<ethers.providers.Log[]>}
         */
        function getEventPatch(provider, address, fromBlock, toBlock) {
            console.log("Getting events '" + eventName + "' from block #" + fromBlock + " to block #" + toBlock);

            return provider.getLogs({
                fromBlock,
                toBlock,
                address: address,
                topics: [event.topic]
            });
        }

        /**
         * Assemble a selection of data out of a log part
         * @param {ethers.providers.Log[]} log the extracted log part
         * @returns { import("../../types").EventInfoDataStruct } the required information to build a db node
         */
        async function getLogData(log) {

            if (log.length == 0) return [];

            /**
             * Extract data from log entry
             * @param {ethers.providers.Log} logEntry a log entry
             * @returns {import("../../types").EventInfoDataStruct} the required information to build a db node
             */
            async function extractData(logEntry) {
                const data = event.decode(logEntry.data, logEntry.topics);

                const sender = data["0"];
                const receiver = data["1"];
                const value = data["2"];

                const decimals = await contract.decimals();
                const displayValue = ethers.utils.formatUnits(value, decimals);

                const blockNumber = logEntry.blockNumber;
                const block = await provider.getBlock(blockNumber);

                const unix_timestamp = ethers.utils.bigNumberify(block.timestamp).toNumber();
                const jsDate = new Date(unix_timestamp * 1000);
                const neoDate = new neo4j.types.DateTime.fromStandardDate(jsDate);


                return {
                    blockNumber: logEntry.blockNumber,
                    date: neoDate,
                    from: sender,
                    to: receiver,
                    value: displayValue
                }
            }

            const result = await Promise.all(log.map(logEntry => extractData(logEntry)));
            logs = logs.concat(result);
            return result;
        }

        // Start serial tasks
        let start = fBlock;
        let end = tBlock;

        let steps = 0;

        while (start != end) {
            let log = undefined;

            await getEventPatch(provider, address, start, end)
                .then(async (result) => {
                    log = await getLogData(result);
                    start = end == tBlock ? end : end + 1;
                    end = tBlock;
                })
                .catch((reason) => { });

            // Devide the batch by 2 until the right amount is found
            while (log === undefined) {
                end = start + Math.floor((end - start) / 2);
                await getEventPatch(provider, address, start, end)
                    .then(async (result) => {
                        log = await getLogData(result);
                    })
                    .catch((reason) => { });
                steps += 1;
            }
            steps += 1;
        }

        console.log(logs.length + " event(s) detected!", "required " + steps + " steps");
        return { logs, steps };
    }

    /**
     * Watch event with particular model
     * @param {string} eventName name of the event, usually 'Transfer'
     * @param {string} usingRel name of the relationship that we use in DB
     * @param { Neode.SchemaObject } dbModel the model loaded via require()
     */
    async watchEvents(eventName, usingRel) {

        console.log('Start logging ' + eventName + ' events')

        const startTime = new Date();

        await this.getEvents(eventName)
            .then(async (result) => {

                function generateCSV() {
                    // CSV
                    let records = [];
                    let id = 0;
                    result.logs.forEach((event) => {
                        records.push({
                            source: event.from,
                            dest: event.to,
                            type: 'Directed',
                            id: id,
                            amount: event.value,
                            blockheight: event.blockNumber,
                            datetime: event.date
                        })
                    })

                    const csvExporter = new ExportToCsv({
                        fieldSeparator: ',',
                        quoteStrings: '"',
                        decimalSeparator: '.',
                        showLabels: true,
                        showTitle: false,
                        title: 'Accounts',
                        useTextFile: false,
                        useBom: true,
                        headers: ['Source', 'Target', 'Type', 'id', 'amount', 'blockheight', 'date']
                    });
                    csvExporter.generateCsv(records);
                }


                /**
                 * Persist graph data to DB
                 * @param {Database} dbService the database service
                 * @param {import("../../types").EventInfoDataStruct[]} events 
                 */
                async function persist(dbService, events) {

                    let queries = [];

                    events.forEach((event) => {
                        queries.push({
                            query: "MERGE (src:Account {address: {sender}})\n MERGE (tgt:Account {address: {receiver}})\n MERGE (src)-[r:TRANSFER]->(tgt) ON CREATE SET r.amount = toFloat({amount}), r.blockheight = toInteger({blockheight}), r.date = {date}",
                            params: { sender: event.from, receiver: event.to, amount: event.value, blockheight: event.blockNumber, date: event.date }
                        });
                    });

                    //console.log(queries);
                    await dbService.executeQueries(queries);
                }


                await persist(this._dbService, result.logs);
                console.log("Database updated!");

            })
            .catch((reason) => {
                console.error("Could not retrieve " + eventName + " events", reason);
            });

        const endTime = new Date();
        const elapsedTime = Math.round(endTime - startTime);

        console.log("Finished in " + elapsedTime + " ms", "or " + (elapsedTime / 1000) + " s");
    }
}

export { EthereumWatcher }
