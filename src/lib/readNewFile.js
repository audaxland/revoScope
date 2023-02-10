import Papa from 'papaparse';
import md5 from "md5";

/**
 * Reads a file uploaded via a <input type="file" /> element and returns the content of the file as a string (via a Promise)
 * @param file file resource
 * @returns {Promise<unknown>}
 */
export const readFile = file => (
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    })
);

/**
 * Converts a csv file content string into an array of rows
 * @param fileString {string} content of a csv file
 * @returns {*}
 */
export const readCsvString = fileString => {
    return Papa.parse(fileString, {header: true, skipEmptyLines: false}).data.filter(row => Object.keys(row).length > 1);
}

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
 * @param newUpload {Object} file object from a <input type="file" /> element
 * @returns {Promise<{size, fileData: *, name, count, fileHash: *, lastModified, type}>}
 */
export const readNewStatementFile = async newUpload => {
    const {lastModified, name, size, type} = newUpload;

    if (name.slice(-4).toLowerCase() !== '.csv') {
        throw new Error('Invalid File: ' + name + '. Only CSV files allowed.');
    }
    // convert the file uploaded to a string
    const fileContent = await readFile(newUpload);

    // converts the csv file content string into an array of objects
    const csvContent = readCsvString(fileContent);

    // generates general statistics about the data read
    const statistics = getFileStatistics(csvContent);

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
        fileHash: md5(fileContent),
        name,
        size,
        type,
        lastModified,
        ...statistics,
        count: fileData.length,
        fileData,
    };
}
