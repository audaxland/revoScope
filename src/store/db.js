import Dexie from "dexie";

export const db = new Dexie('revogains');

db.version(2).stores({
    files: '++id, fileHash',
    records: '++id, key, date, Type, *files',
    manualPairs: '++id, key1, key2'
});





