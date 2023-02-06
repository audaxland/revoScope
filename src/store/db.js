import Dexie from "dexie";

export const db = new Dexie('revogains');

export const dbSchema = {
    files: '++id, fileHash',
    records: '++id, key, date, Type, *files',
    manualPairs: '++id, key1, key2'
}

db.version(2).stores(dbSchema);





