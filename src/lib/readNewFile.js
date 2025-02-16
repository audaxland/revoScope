import md5 from "md5";
import {readCsvString, readCsvUploadFile} from "./uploadHelper";


/**
 * Extracts general statistics from a csv statement file data
 * @param rows {Object[]} rows of data read from a csv revolut statement
 * @returns {Object}
 */
const getFileStatistics = rows => {
    return rows.reduce((prev, curr) => {
            if ((!prev.fromStartDate) || (curr['Started Date'] < prev.fromStartDate)) {
                prev.fromStartDate = curr['Started Date'];
            }
            if ((!prev.toStartDate) || (curr['Started Date'] > prev.toStartDate)) {
                prev.toStartDate = curr['Started Date'];
            }
            if ((!prev.fromCompletedDate) || (curr['Completed Date'] < prev.fromCompletedDate)) {
                prev.fromCompletedDate = curr['Completed Date'];
            }
            if ((!prev.toCompletedDate) || (curr['Completed Date'] > prev.toCompletedDate)) {
                prev.toCompletedDate = curr['Completed Date'];
            }
            prev.currencies[curr.Currency] = (prev.currencies[curr.Currency] ?? 0) + 1;
            if (curr.Type === "EXCHANGE") {
                prev.exchanges++;
            }
            return prev;
        },
        {
            fromStartDate: null,
            toStartDate: null,
            fromCompletedDate: null,
            toCompletedDate: null,
            currencies: {},
            exchanges: 0,
        }
    );
}

/**
 * Handles the upload of a statement csv file
 * @param newUpload {File} file object from a <input type="file" /> element
 * @returns {Promise<{size, fileData: *, name, count, fileHash: *, lastModified, type}>}
 */
export const readNewStatementFile = async newUpload => {
    const {csvContent, fileHash, lastModified, name, size, type} = await readCsvUploadFile(newUpload);

    return await processNewStatementFile({csvContent, fileHash, lastModified, name, size, type});
}

/**
 * Reads a new csv file content and inserts the corresponding data in IndexDB
 * A file can be uploaded either via the <input type="file" /> element or directly from the app (for the demo files)
 * Processing is the same once we have the file content.
 * @param csvContent {Object[]} content of the csv file as array of objects
 * @param fileHash {string} md5 hash of the original file
 * @param lastModified {number} number to keep as last modification of the file
 * @param name {string} name of the file
 * @param size {number} size of the file
 * @param type {string} here this should always be 'text/csv'
 * @returns {Promise<{size: number, fileData: Object[], name: string, count: number, fileHash: string, lastModified: number, type: string}>}
 */
export const processNewStatementFile = async ({csvContent, fileHash, lastModified, name, size, type}) => {

    // generates general statistics about the data read
    const statistics = getFileStatistics(csvContent);

    // if there is not "Start Date" then the csv file is not a statement file
    if (!statistics.fromStartDate) {
        throw new Error('Invalid File: ' + name + '. This file does not seem to be a revolut statement file.');
    }

    // adds additional fields to the rows read, mostly the key and the hash that will be used later as index inside IndexDB
    const fileData = csvContent.map(row => {
        // the amount is not included in the hash because revolut is not consistent in the way it calculates the amount
        const hashField = {
            'Type': row['Type'],
            'Currency': row['Currency'],
            'Started Date': row['Started Date'],
            'Completed Date': row['Completed Date'],
            'Balance': row['Balance'],
        };
        const hash = md5(JSON.stringify(hashField));
        const key = row['Started Date'].replaceAll(/[^0-9]/g, '_') + '_' + hash;
        const date = new Date(row['Started Date']);
        return {
            key,
            hash,
            date,
            ...row,
        }
    });

    return {
        fileHash,
        name,
        size,
        type,
        lastModified,
        ...statistics,
        count: fileData.length,
        fileData,
    };
}

/**
 * Loads a csv file from a path
 * this is used to load the demo files
 * @param path {string} path to the file
 * @param name {string} name of the file
 * @returns {Promise<{size: number, fileData: Object[], name: string, count: number, fileHash: string, lastModified: number, type: string}>}
 */
export const readNewDemoStatementFile = async (path, name) => {
    const lastModified = (new Date()).getTime();
    const type = "text/csv";

    // convert the file uploaded to a string
    const fileContent = await fetch(path).then(res => res.text());
    const size = fileContent.length;
    const fileHash = md5(fileContent);

    // converts the csv file content string into an array of objects
    const csvContent = readCsvString(fileContent);

    return await processNewStatementFile({csvContent, fileHash, lastModified, type, size, name});
}
