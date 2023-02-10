import {db} from "./db";

/**
 * find a manual pair that includes a given record key
 * @param key {string} record key
 * @returns {Promise<T|null>}
 */
export const getManualPair = async key => {
    const pair1 = await db.manualPairs.where('key1').equals(key).first();
    if (pair1) return pair1;
    const pair2 = await db.manualPairs.where('key2').equals(key).first();
    if (pair2) return pair2;
    return null;
}

/**
 * Create a manual pair
 * @param key1 {string} first record key of the pair
 * @param key2 {string} second record key of the pair
 * @returns {Promise<boolean>}
 */
export const setManualPair = async (key1, key2) => {
    try {
        if (await db.manualPairs.where('key1').equals(key1).first()) return false;
        if (await db.manualPairs.where('key1').equals(key2).first()) return false;
        if (await db.manualPairs.where('key2').equals(key1).first()) return false;
        if (await db.manualPairs.where('key2').equals(key2).first()) return false;

        await db.manualPairs.add({key1, key2});
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Delete a manual pair using the key of one of its records
 * @param key {string} record key of one of the pair record
 * @returns {Promise<boolean>}
 */
export const deleteManualPairByKey = async key => {
    try {
        const pair = await getManualPair(key);
        if (!pair) return false;
        await db.manualPairs.delete(pair.id);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Delete a manual pair by its id in IndexDB
 * @param id {string} if of the pair to delete
 * @returns {Promise<boolean>}
 */
export const deleteManualPairById = async id => {
    try {
        await db.manualPairs.delete(id);
        return true;
    } catch (error) {
        return false;
    }
}
