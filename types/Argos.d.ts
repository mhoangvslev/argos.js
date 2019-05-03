import { Watcher } from "./Watcher";

export declare class Argos {
    watcher: Watcher;

     /**
     * Create argos object
     * @param {Watcher} watcher the watcher instance
     */
    constructor(watcher: Watcher);

     /**
     * Start collecting events and persists data to the database
     */
    initArgos(): void;
}