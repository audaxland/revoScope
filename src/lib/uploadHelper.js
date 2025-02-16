import md5 from "md5";
import Papa from "papaparse";

/**
 * Reads a file uploaded via a <input type="file" /> element and returns the content of the file as a string (via a Promise)
 * @param file {File} file resource
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
 * handles reading a csv file uploaded and returns the content of the file and the file metadata
 * @param newUpload {File} file resource uploaded via a <input type="file" /> element
 * @returns {Promise<{csvContent: ({length}|*), fileHash: *, lastModified, name, size, type}>}
 */
export const readCsvUploadFile = async newUpload => {
    const {lastModified, name, size, type} = newUpload;

    if (newUpload.name.slice(-4).toLowerCase() !== '.csv') {
        throw new Error('Invalid File: ' + newUpload.name + '. Only CSV files allowed.');
    }
    // convert the file uploaded to a string
    const fileContent = await readFile(newUpload);
    const fileHash = md5(fileContent);

    // converts the csv file content string into an array of objects
    const csvContent = readCsvString(fileContent);

    // if no rows where parsed, the file must not have been a csv file
    if (!csvContent.length) {
        throw new Error('Invalid File: ' + name + '. This does not seem to be a valid csv file.');
    }

    return {csvContent, fileHash, lastModified, name, size, type}
}
