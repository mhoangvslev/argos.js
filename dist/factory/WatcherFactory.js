"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EthereumWatcher_1 = require("../watcher/EthereumWatcher");
var WatcherFactory = /** @class */ (function () {
    function WatcherFactory() {
    }
    /**
     * Create a database instance
     * @param {WatcherConstructor} args the arguments corresponding to the class
     * @returns {Watcher} a database instance or nothing
     */
    WatcherFactory.createWatcherInstance = function (args) {
        switch (args.type) {
            case 0 /* EthereumWatcher */:
                return new EthereumWatcher_1.EthereumWatcher(args.address, args.abi, args.provider, args.db, args.providerConf, args.clearDB, args.exportDir);
            default:
                return undefined;
        }
    };
    return WatcherFactory;
}());
exports.WatcherFactory = WatcherFactory;
exports.default = WatcherFactory;
