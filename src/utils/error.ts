
export const enum WatcherError {
    ERROR_WATCHER_CONTRACT_CALL = "ERROR_WATCHER_CONTRACT_CALL",
    ERROR_WATCHER_PROCESS_DATA = "ERROR_WATCHER_PROCESS_DATA",
    ERROR_WATCHER_EXTRACT_DATA = "ERROR_WATCHER_EXTRACT_DATA",
    ERROR_WATCHER_TIMEOUT = "ERROR_WATCHER_TIMEOUT",
    ERROR_WATCHER_GETLOGDATA = "ERROR_WATCHER_GETLOGDATA",
    ERROR_WATCHER_GETEVENTS = "ERROR_WATCHER_GETEVENTS",
    ERROR_WATCHER_WATCHEVENTS = "ERROR_WATCHER_WATCHEVENTS",
    ERROR_WATCHER_PROVIDER_GETLOGS = "ERROR_WATCHER_PROVIDER_GETLOGS"
}

export const enum DatabaseError {
    ERROR_DB_QUERY = "ERROR_DB_QUERY",
    ERROR_DB_IMPORT = "ERROR_DB_IMPORT",
    ERROR_DB_PERSIST = "ERROR_DB_PERSIST",
    ERROR_DB_EXPORT = "ERROR_DB_EXPORT"
}

export type ArgosError = WatcherError | DatabaseError;

export interface ErrorMessage {
    type: ArgosError;
    reason: string;
    params?: { [name: string]: any };
}

export function throwError(em: ErrorMessage) {
    const error = new Error();
    error.name = em.type;
    error.message = em.reason + "\n";
    console.error(em.params);
    throw error;
}
