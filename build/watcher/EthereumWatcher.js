'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EthereumWatcher = exports.default = void 0;

var _ethers = require("ethers");

var _Database = _interopRequireDefault(require("../database/Database"));

var _Watcher = require("./Watcher");

var Neode = _interopRequireWildcard(require("neode"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
   * @param {string | number} fromBlock the start block, default is 0
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
    }).catch(reason => {
      console.log(reason);
    });
    return logs.map(log => event.decode(log.data, log.topics));
  }
  /**
   * Watch event with particular model
   * @param {string} eventName name of the event, usually 'Transfer'
   * @param { Neode.SchemaObject } dbModel the model loaded via require()
   */


  async watchEvents(eventName) {
    console.log('Start logging ' + eventName + ' events');
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

exports.EthereumWatcher = exports.default = EthereumWatcher;