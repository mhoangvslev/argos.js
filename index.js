import Watcher from "./src/watcher/Watcher";

export default class Argos {

    /**
     * Create argos object
     * @param {Watcher} watcher the watcher instance
     */
    constructor(watcher){
        this.watcher = watcher;
    }

    /**
     * Start collecting events and persists data to the database
     */
    initArgos() {
        this.watcher.watchEvents();
    }
}