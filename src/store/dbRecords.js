import {db} from "./db";

/**
 * get a record from IndexDB using its key
 * @param key
 * @returns {Promise<T>}
 */
export const getRecordByKey = async key => {
    return await db.records.where('key').equals(key).first();
}

/**
 * returns all the records from IndexDB
 * @returns {Promise<Array<any>>}
 */
export const getAllRecords = async () => {
    return await db.records.orderBy('date').toArray();
}
