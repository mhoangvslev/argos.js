"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Neo4J", {
  enumerable: true,
  get: function () {
    return _Neo4J.Neo4J;
  }
});
Object.defineProperty(exports, "Database", {
  enumerable: true,
  get: function () {
    return _Database.Database;
  }
});
Object.defineProperty(exports, "EthereumWatcher", {
  enumerable: true,
  get: function () {
    return _EthereumWatcher.EthereumWatcher;
  }
});
Object.defineProperty(exports, "Watcher", {
  enumerable: true,
  get: function () {
    return _Watcher.Watcher;
  }
});
exports.Argos = exports.default = void 0;

var _Neo4J = require("./database/Neo4J");

var _Database = require("./database/Database");

var _EthereumWatcher = require("./watcher/EthereumWatcher");

var _Watcher = require("./watcher/Watcher");

class Argos {
  /**
   * Create argos object
   * @param {Watcher} watcher the watcher instance
   */
  constructor(watcher) {
    this.watcher = watcher;
  }
  /**
   * Start collecting events and persists data to the database
   */


  initArgos() {
    this.watcher.watchEvents('Transfer');
  }

}

exports.Argos = exports.default = Argos;