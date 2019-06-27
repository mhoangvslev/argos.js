import { WatcherEnum } from "../utils/types";
import { EthereumWatcher } from "../watcher/EthereumWatcher";
import { WatcherConstructor } from "../watcher/Watcher";

export default class WatcherFactory {

    /**
     * Create a database instance
     * @param {WatcherConstructor} args the arguments corresponding to the class
     * @returns {Watcher} a database instance or nothing
     */
    public static createWatcherInstance(args: WatcherConstructor) {

        switch (args.type) {
            case WatcherEnum.EthereumWatcher:
                return new EthereumWatcher(args.address, args.abi, args.provider, args.db, args.providerConf, args.clearDB, args.exportDir);
            default:
                return undefined;
        }
    }
}

export { WatcherFactory };
