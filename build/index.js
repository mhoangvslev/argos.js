"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Argos = void 0;

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
    this.watcher.watchEvents();
  }

}

exports.Argos = Argos;
exports.Argos = Argos;