import {db} from "./db";

export const getManualPair = async key => {
    const pair1 = await db.manualPairs.where('key1').equals(key).first();
    if (pair1) return pair1;
    const pair2 = await db.manualPairs.where('key2').equals(key).first();
    if (pair2) return pair2;
    return null;
}

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

export const deleteManualPairById = async id => {
    try {
        await db.manualPairs.delete(id);
        return true;
    } catch (error) {
        return false;
    }
}
