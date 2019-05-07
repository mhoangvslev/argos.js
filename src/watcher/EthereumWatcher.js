'use strict'

import { ethers } from "ethers";
import Database from "../database/Database";
import { Watcher } from "./Watcher";
import * as Neode from "neode";
import { v1 as neo4j } from 'neo4j-driver';
import Web3 from "web3";

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
     * @param { Database } dbService the database servcice
     * @param {object} config the loaded config file
     * @returns {EthereumWatcher} Ethereum instance
     */
    constructor(contractAddr, abi, providerType, dbService, config) {
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
                    //console.log("Infura: ", config.infura.projectId, "@", config.infura.network);
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
        this._dbService = dbService;

        this._provider = getProvider(providerType, config);
        this._contract = new ethers.Contract(this._contractAddr, abi, this._provider);
        //console.log(this._contract);
    }

    /**
     * Get events from log 
     * @param {string} eventName the event name to watch
     * @param {string | number} fromBlock the start block, default is 0
     * @param {string | number} toBlock  the ending block, default is 'lastest'
     */
    async getEvents(eventName, fromBlock = 0, toBlock = 'latest', nbThreads = 5) {

        const latestBlock = await this._provider.getBlockNumber();
        const tBlock = toBlock == 'latest' ? latestBlock : toBlock;

        var event = this._contract.interface.events[eventName];

        function getEventPatch(provider, address, fromBlock, toBlock) {
            console.log("Getting events '" + event.topic + "' from block #" + fromBlock + " to block #" + toBlock);

            return provider.getLogs({
                fromBlock,
                toBlock,
                address: address,
                topics: [event.topic]
            });
        }

        async function getLogData(log, provider, contract) {

            const data = event.decode(log.data, log.topics);

            const sender = data.from;
            const receiver = data.to;

            const decimals = await contract.decimals();
            const value = ethers.utils.formatUnits(data.value, decimals);

            const blockNumber = log.blockNumber;
            const block = await provider.getBlock(blockNumber);

            const unix_timestamp = block.timestamp;
            const jsDate = new Date(unix_timestamp * 1000);
            const neoDate = new neo4j.types.Date.fromStandardDate(jsDate);


            return {
                blockNumber: log.blockNumber,
                date: neoDate,
                from: sender,
                to: receiver,
                value: value
            }
        }

        const logs = await getEventPatch(this._provider, this._contractAddr, fromBlock, tBlock);

        return await Promise.all(logs.map(log => getLogData(log, this._provider, this._contract)));
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

        const events = await this.getEvents(eventName).catch((reason) => { console.log(reason) });

        events.forEach((event) => {
            this._dbService.dbCreateNodes(
                { address: event.from },
                { address: event.to },
                usingRel,
                { amount: event.value, blockheight: event.blockNumber, date: event.date }
            );

        });

        console.log("Database updated!");

        const endTime = new Date();
        const elapsedTime = Math.round(endTime - startTime);

        console.log("Finished in " + elapsedTime + " ms", "or " + (elapsedTime / 1000) + " s");

    }
}

export { EthereumWatcher }
