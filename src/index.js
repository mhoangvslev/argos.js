"use-strict"

import Database from "./database/Database";
import Watcher from "./watcher/Watcher";

export default class Argos {

    /**
     * Create argos ibject
     * @param {Database} database 
     * @param {Watcher} watcher 
     * @param {object} config 
     */
    constructor(database, watcher, config){
        this._database = database;
        this._watcher = watcher;
    }

    initArgos() {
        this._watcher.watchEvents();
    }
}

module.exports = Argos;
