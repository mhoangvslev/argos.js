
export const enum WatcherError {
    ERROR_WATCHER_CONTRACT_CALL = "ERROR_WATCHER_CONTRACT_CALL",
    ERROR_WATCHER_PROCESS_DATA = "ERROR_WATCHER_PROCESS_DATA",
    ERROR_WATCHER_EXTRACT_DATA = "ERROR_WATCHER_EXTRACT_DATA"
}

export const enum DatabaseError {
    ERROR_DB_QUERY = "ERROR_DB_QUERY",
    ERROR_DB_IMPORT = "ERROR_DB_IMPORT",
    ERROR_DB_PERSIST = "ERROR_DB_PERSIST"
}

export type ArgosError = WatcherError | DatabaseError;

export interface IErrorMessage {
    type: ArgosError;
    reason: string;
    params?: { [name: string]: any };
}

export function throwError(em: IErrorMessage) {
    const error = new Error();
    error.name = em.type;
    error.message = em.reason
        + "params: " + JSON.stringify(em.params);
    throw error;
}
