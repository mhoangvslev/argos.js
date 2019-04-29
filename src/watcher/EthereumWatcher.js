import Watcher from "./Watcher";
import Database from "../database/Database";

export default class EthereumWatcher extends Watcher{

    /**
     * Create a watcher for Ethereum network
     * @param {string} contractAddr the address of the verified contract
     * @param {string} abi the ABI of the verified contract
     * @param {string} apiToken the Etherscan API Token
     * @param {Database} dbService the database servcice
     */
    constructor(contractAddr, abi, apiToken, dbService) {
        this._provider = new ethers.providers.EtherscanProvider('homestead', etherScanAPI);
        this._dbService = dbService;
        this._contract = new ethers.Contract(contractAddr, abi, this._provider);
        console.log(this._contract);
    }

    /**
     * Get events from log 
     * @param {*} eventName the event name to watch
     * @param {*} fromBlock the start block, default is 0
     * @param {*} toBlock  the ending block, default is 'lastest'
     */
    async getEvents(eventName, fromBlock = 0, toBlock = 'latest') {

        console.log("Getting events '" + eventName + "' from block #" + fromBlock + " to block #" + toBlock)
        let event = this._contract.interface.events[eventName];

        let logs = await this._provider.getLogs({
            fromBlock,
            toBlock,
            address: this._contractAddr,
            topics: [event.topic]
        });

        return logs.map(log => event.decode(log.data, log.topics))
    }

    /**
     * Watch eve
     * @param {string} eventName 
     */
    async watchEvents(eventName) {

        console.log('Start logging '+ eventName +' events')

        this._dbService.dbCreateModel();
        const events = await this.getEvents(eventName);

        //console.log(events);

        var p = Promise.resolve();

        events.forEach((event) => {
            let sender = event.from;
            let receiver = event.to;
            let value = event.value;
            let strValue = value.toString();

            this._dbService.dbCreateNode(sender, receiver, strValue);

        });
        console.log("Database updated!");
    }
}