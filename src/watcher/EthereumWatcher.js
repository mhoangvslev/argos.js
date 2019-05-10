'use strict'

import { ethers } from "ethers";
import { Watcher } from "./Watcher";
import * as Neode from "neode";
import { v1 as neo4j } from 'neo4j-driver';
import Web3 from "web3";
import DatabaseFactory from "../factory/DatabaseFactory";

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
        if (this._dbService !== undefined)
            this._dbService.dbTerminate();

        this._dbService = DatabaseFactory.createDbInstance(this._dbType);
        this._dbService.dbCreateModel(this._dbType.model);

        if(this._clearDB) {
            this._dbService.dbClearAll();
        }
    }

    /**
     * Get events from log 
     * @param {string} eventName the event name to watch
     * @param {string | number} fromBlock the start block, default is 0
     * @param {string | number} toBlock  the ending block, default is 'lastest'
     * @param {number} nbTasks how many batches required to process the log
     */
    async getEvents(eventName, fromBlock = 0, toBlock = 'latest') {

        this.refreshDB();

        const latestInDB = await this._dbService.executeQuery({
            query: 'MATCH (n) WHERE EXISTS(n.blockheight) RETURN DISTINCT "node" as entity, n.blockheight AS blockheight UNION ALL MATCH ()-[r]-() WHERE EXISTS(r.blockheight) RETURN DISTINCT "relationship" AS entity, r.blockheight AS blockheight ORDER BY r.blockheight DESC LIMIT 1',
            params: {

            }
        });

        const fBlock = this._clearDB ? (fromBlock == 'earliest' ? 0 : fromBlock) : latestInDB[0].get("blockheight");
        this._dbService.dbTerminate();


        const latestBlock = await this._provider.getBlockNumber();
        const tBlock = toBlock == 'latest' ? latestBlock : toBlock;

        const provider = this._provider;
        const address = this._contractAddr;
        const contract = this._contract;

        let logs = [];
        let event = this._contract.interface.events[eventName];

        console.log("Latest block in blockchain is #" + tBlock)


        /**
         * 
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
                    date: jsDate,
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
            }
        }

        console.log(logs.length + " event(s) detected!");
        return logs;
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
            .then((events) => {

                this.refreshDB();
                events.forEach((event) => {
                    this._dbService.dbCreateNodes(
                        { address: event.from },
                        { address: event.to },
                        usingRel,
                        { amount: event.value, blockheight: event.blockNumber, date: event.date }
                    );
                });
                this._dbService.dbTerminate();

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
