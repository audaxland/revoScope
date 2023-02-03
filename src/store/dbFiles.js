import {db} from "./db";
import { getRecordByKey} from "./dbRecords";

export const insertFile = (fileDetails, fileData) => {
    return db.transaction('rw', db.files, db.records, async () => {
        const maybeExisting = await db.files.where({fileHash: fileDetails.fileHash}).count();
        if (maybeExisting) {
            throw new Error(`The file "${fileDetails.name}" is already loaded`);
        }
        const fileId = await db.files.add(fileDetails);
        let existingRecord = null;
        for (const record of fileData) {
            existingRecord = await getRecordByKey(record.key);
            if (existingRecord) {
                await db.records.update(existingRecord, {files: [...existingRecord.files, fileId]})
            } else {
                await db.records.add({...record, files: [fileId]});
            }
        }
        return fileId;
    })
}

export const deleteFile = async fileId => {
    return db.transaction('rw', db.files, db.records, async () => {
        await db.records.where('files').equals(fileId).each( record => {
            if (record.files.length === 1) {
                db.records.delete(record.id);
            } else {
                db.records.update(record.id, {files: record.files.filter(id => id !== fileId)});
            }
        });
        await db.files.delete(fileId);
    });
}
