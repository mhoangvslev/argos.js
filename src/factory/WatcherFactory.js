'use strict'

import EthereumWatcher from "../watcher/EthereumWatcher";
import Watcher from "../watcher/Watcher";

export const WatcherEnum = {
    EthereumWatcher: 0
}

export default class WatcherFactory {

    /**
     * Create a database instance
     * @param {import("../../types").WatcherConstructor} args the arguments corresponding to the class
     * @returns {Watcher} a database instance or nothing
     */
    static createWatcherInstance(args) {

        switch (args.type) {
            case WatcherEnum.EthereumWatcher:
                return new EthereumWatcher(args.address, args.abi, args.provider, args.db, args.providerConf, args.clearDB);
            default:
                return undefined;
        }
    }
}

export { WatcherFactory }