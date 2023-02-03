import {db} from "./db";


export const getRecordByKey = async key => {
    return await db.records.where('key').equals(key).first();
}

export const getAllRecords = async () => {
    return await db.records.orderBy('date').toArray();
}
