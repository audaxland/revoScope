import {db, dbSchema} from "./db";
import { getRecordByKey} from "./dbRecords";

/**
 * Gets data read from an uploaded csv file, and populates that data in IndexDB
 * @param fileDetails {Object} Metadata about the file uploaded
 * @param fileData {Object[]} rows read from the csv file
 * @returns {Promise<*>}
 */
export const insertFile = (fileDetails, fileData) => {
    return db.transaction('rw', db.files, db.records, async () => {
        // it the user tries to upload the same file twice, we return an error
        const maybeExisting = await db.files.where({fileHash: fileDetails.fileHash}).count();
        if (maybeExisting) {
            throw new Error(`The file "${fileDetails.name}" is already loaded`);
        }

        const fileId = await db.files.add(fileDetails);
        let existingRecord = null;
        for (const record of fileData) {
            // the same record can be present in multiple statement files,
            // so check first if already have an identical record, if so update it with an addition file origin,
            // but don't duplicate it
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

/**
 * Remove a file from IndexDB
 * @param fileId {number} index of the file to delete
 * @returns {Promise<unknown>}
 * @todo here there is a bug, if you try to delete too quickly multiple files that share the same records, some record don't seem to get deleted, not sure why
 */
export const deleteFile = async fileId => {
    return db.transaction('rw', db.files, db.records, async () => {
        // before we delete the metadata about the file, we first want to delete all the records from that file
        await db.records.where('files').equals(fileId).each( record => {
            if (record.files.length === 1) {
                db.records.delete(record.id);
            } else {
                db.records.update(record.id, {files: record.files.filter(id => id !== fileId)});
            }
        });

        // delete the file metadata
        await db.files.delete(fileId);

        // if there are no more files, clear all tables un case some records were left behind
        if (!(await db.files.count())) {
            Object.keys(dbSchema).forEach(table => db[table].clear());
        }
    });
}
