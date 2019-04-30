import { Database } from "../database/Database";

export default class Watcher{

    /**
     * Create a watcher for Ethereum network
     * @param {string} contractAddr the address of the verified contract
     * @param {string} abi the ABI of the verified contract
     * @param {string} apiToken the Etherscan API Token
     * @param {Database} dbService the database servcice
     * @returns {Database}
     */
    constructor(contractAddr, abi, apiToken, dbService) {
        console.log("Watcher " + typeof(this) + " created!");
    }

    /**
     * Get events from log 
     * @param {string} eventName the event name to watch
     * @param {string} fromBlock the start block, default is 0
     * @param {string} toBlock  the ending block, default is 'lastest'
     */
    async getEvents(eventName, fromBlock = 0, toBlock = 'latest') {
        console.log("Getting " + eventName + " events");
    }

    /**
     * Watch eve
     * @param {string} eventName 
     */
    async watchEvents(eventName) {
        console.log('Start logging '+ eventName +' events')
    }
}