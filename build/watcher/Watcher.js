'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Watcher = void 0;

var _Database = require("../database/Database");

class Watcher {
  /**
   * Create a watcher for Ethereum network
   * @param {string} contractAddr the address of the verified contract
   * @param {string} abi the ABI of the verified contract
   * @param {string} apiToken the Etherscan API Token
   * @param {Database} dbService the database servcice
   * @returns {Database}
   */
  constructor(contractAddr, abi, apiToken, dbService) {
    console.log("Watcher " + typeof this + " created!");
  }

}

exports.Watcher = Watcher;