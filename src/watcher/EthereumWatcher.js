'use strict'

import { ethers } from "ethers";
import Database from "../database/Database";
import { Watcher } from "./Watcher";
import * as Neode from "neode";
import { concurrent } from "concurrent-worker";

export default class EthereumWatcher extends Watcher {

    /**
     * Create a watcher for Ethereum network
     * @param {string} contractAddr the address of the verified contract
     * @param {string} abi the ABI of the verified contract
     * @param {string} apiToken the Etherscan API Token
     * @param { Database } dbService the database servcice
     * @returns {EthereumWatcher} Ethereum instance
     */
    constructor(contractAddr, abi, apiToken, dbService) {
        super();
        this._contractAddr = contractAddr;
        this._dbService = dbService;

        this._provider = new ethers.providers.EtherscanProvider('homestead', apiToken);
        this._contract = new ethers.Contract(this._contractAddr, abi, this._provider);
        console.log(this._contract);
    }

    /**
     * Get events from log 
     * @param {string} eventName the event name to watch
     * @param {string | number} fromBlock the start block, default is 0
     * @param {string | number} toBlock  the ending block, default is 'lastest'
     */
    async getEvents(eventName, fromBlock = 0, toBlock = 'latest', nbThreads = 2) {

        const latestBlock = await this._provider.getBlockNumber();
        const tBlock = toBlock == 'latest' ? latestBlock : toBlock;

        var event = this._contract.interface.events[eventName];

        //console.log("Provider: ", provider, "Address: ", address);
        console.log("Getting events '" + event + "' from block #" + fromBlock + " to block #" + tBlock);

        const logs = await this._provider.getLogs({
            fromBlock,
            toBlock,
            address: this._contractAddr,
            topics: [event.topic]
        });

        /*
        const concurrentWorker = concurrent(getEventPatch);
        var tasks = [];

        const range = Math.ceil((tBlock - fromBlock) / nbThreads);
        let start = fromBlock;

        for (let i = 0; i < nbThreads; i++) {
            const tStart = start;
            const task = concurrentWorker.run([this._provider, this._contractAddr, event, tStart, tStart + range]);
            tasks = tasks.concat(task);
            start += range;
        }

        const processes = Promise.all(tasks);
        const results = await processes;
        const logs = results.reduce( (prev, current) => (prev.concat(current)), [] );
        */

        return logs.map(log => event.decode(log.data, log.topics))
    }

    /**
     * Watch event with particular model
     * @param {string} eventName name of the event, usually 'Transfer'
     * @param { Neode.SchemaObject } dbModel the model loaded via require()
     */
    async watchEvents(eventName) {

        console.log('Start logging ' + eventName + ' events')

        const events = await this.getEvents(eventName);

        //console.log(events);

        var p = Promise.resolve();

        events.forEach((event) => {
            let sender = event.from;
            let receiver = event.to;
            let value = event.value;
            let strValue = value.toString();

            this._dbService.dbCreateNodes({ address: sender }, { address: receiver }, 'send', 'receive', { amount: strValue });

        });
        console.log("Database updated!");
    }
}

export { EthereumWatcher }
