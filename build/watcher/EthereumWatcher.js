'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EthereumWatcher = void 0;

var _ethers = require("ethers");

var _Database = _interopRequireDefault(require("../database/Database"));

var _Watcher = require("./Watcher");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class EthereumWatcher extends _Watcher.Watcher {
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
    this.provider = new _ethers.ethers.providers.EtherscanProvider('homestead', apiToken);
    this.dbService = dbService;
    this.contract = new _ethers.ethers.Contract(contractAddr, abi, this.provider);
    console.log(this.contract);
  }
  /**
   * Get events from log 
   * @param {string} eventName the event name to watch
   * @param {string} fromBlock the start block, default is 0
   * @param {string} toBlock  the ending block, default is 'lastest'
   */


  async getEvents(eventName, fromBlock = 0, toBlock = 'latest') {
    console.log("Getting events '" + eventName + "' from block #" + fromBlock + " to block #" + toBlock);
    let event = this.contract.interface.events[eventName];
    let logs = await this.provider.getLogs({
      fromBlock,
      toBlock,
      address: this._contractAddr,
      topics: [event.topic]
    });
    return logs.map(log => event.decode(log.data, log.topics));
  }
  /**
   * Watch eve
   * @param {string} eventName 
   */


  async watchEvents(eventName) {
    console.log('Start logging ' + eventName + ' events');
    this.dbService.dbCreateModel();
    const events = await this.getEvents(eventName); //console.log(events);

    var p = Promise.resolve();
    events.forEach(event => {
      let sender = event.from;
      let receiver = event.to;
      let value = event.value;
      let strValue = value.toString();
      this.dbService.dbCreateNode(sender, receiver, strValue);
    });
    console.log("Database updated!");
  }

}

exports.EthereumWatcher = EthereumWatcher;