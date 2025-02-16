import {useState} from "react";
import {readNewExternalFile} from "../lib/externalFileHelper";

/**
 * Hook to store and handle the external files that the user may provide to include additional records in the form 8949 files
 * @returns {{addExternalFile: ((function(*): Promise<void>)|*), externalFiles: *[], externalRecords: *[], yearExternalRecords: (function(*): *[]), clearAllExternalFiles: clearAllExternalFiles}}
 */
const useExternalFile = () => {
    /**
     * @type externalFiles {Object[]} list of external files metadata that the user has uploaded in the app
     */
    const [externalFiles, setExternalFiles] = useState([]);

    /**
     * @type externalRecords {Object[]} list of external records read from the external files that will be added to the form 8949 files
     */
    const [externalRecords, setExternalRecords] = useState([]);

    /**
     * Read an external file and add its data to the current state
     * @param file {File} external data csv file that the user is uploading
     * @returns {Promise<void>}
     */
    const addExternalFile = async file => {
        const {
            externalRecords,
            fileHash,
            lastModified,
            name,
            size,
            type,
            countPerYear
        } = await readNewExternalFile(file);
        if (externalFiles.find(file => file.fileHash === fileHash)) {
            throw new Error('External file already uploaded: ' + name);
        }
        setExternalFiles(old => [...old, {fileHash, lastModified, name, size, type, countPerYear}]);
        setExternalRecords(old => [...old, ...externalRecords]);
    }

    /**
     * Reset the state to clear all external data files the user previously uploaded
     */
    const clearAllExternalFiles = () => {
        setExternalFiles([]);
        setExternalRecords([]);
    }

    /**
     * Return the external data records filtered to only include the sales that occurred in the requested year
     * @param year {string|number} year to filter the external records for
     * @returns {Object[]}
     */
    const yearExternalRecords = year => {
        return externalRecords.filter(row => row?.c.match(`${year}$`));
    }

    return {
        addExternalFile,
        externalFiles,
        externalRecords,
        yearExternalRecords,
        clearAllExternalFiles
    }
}

export default useExternalFile;
