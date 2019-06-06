import { WatcherConstructor } from "..";
import { EthereumWatcher } from "../watcher/EthereumWatcher";
export default class WatcherFactory {
    /**
     * Create a database instance
     * @param {WatcherConstructor} args the arguments corresponding to the class
     * @returns {Watcher} a database instance or nothing
     */
    static createWatcherInstance(args: WatcherConstructor): EthereumWatcher;
}
export { WatcherFactory };
