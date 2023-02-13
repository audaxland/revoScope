import Dexie from "dexie";

/**
 * Dexie instance to access the IndexDB database
 * @type {Dexie}
 */
export const db = new Dexie('revoscope');

/**
 * Schema for the IndexDB database
 * @type {{manualPairs: string, records: string, files: string}}
 *      files: contains the metadata about files uploaded
 *      records: contains the data read from the csv files
 *      manualPairs: contains the list of pairs record keys that the user has set manually
 */
export const dbSchema = {
    files: '++id, fileHash',
    records: '++id, key, date, Type, *files',
    manualPairs: '++id, key1, key2'
}

db.version(2).stores(dbSchema);





