'use strict'

import { Database } from "../database/Database";

export class Watcher{

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

}
