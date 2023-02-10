import {useLiveQuery} from "dexie-react-hooks";
import {db} from "../store/db";
import {useEffect, useState} from "react";
import {readNewDemoStatementFile, readNewStatementFile} from "../lib/readNewFile";
import {countRecords, deleteFile, insertFile} from "../store/dbFiles";

/**
 * Handles the state of the files uploaded information
 * @returns {{
 *              removeFile: ((function(string): Promise<void>)),
 *              files: Object[],
 *              fileMap: {},
 *              addFile: ((function(*): Promise<void>))
 * }}
 */
const useFiles = () => {
    /**
     * @type {Object[]} array of files read from IndexDB
     */
    const files = useLiveQuery(() => db.files.toArray());

    /**
     * @type {[int, function]} number of records in the IndexDB records table
     */
    const [nbRecords, setNbRecord] = useState(0)

    /**
     * @type {Object} map of {<fileId>: <file Name>} that maps the file's id to their corresponding file name
     */
    const [fileMap, setFileMap] = useState({});

    // computes the fileMap based on the list of files we have
    useEffect(() => {
        if ((!files)) return;
        setFileMap(files.reduce((prev, curr) => {
            prev[curr.id] = curr.name;
            return prev;
        }, {}));
        (async () => {
            setNbRecord(await countRecords());
        })();
    }, [files]);

    /**
     * Upload a file to IndexDB
     * @param file : this is a file as created by the <input type="file" /> component
     * @returns {Promise<void>}
     */
    const addFile = async file => {
        /**
         * @type fileData {Object[]}} list of rows read from the file
         * @type fileDetails {Object} metadata about the files uploaded
         */
        const {fileData, ...fileDetails} = await readNewStatementFile(file);
        await insertFile(fileDetails, fileData);
        setNbRecord(await countRecords());
    }

    /**
     * Load a demo file to IndexDB
     * @param path {string} path to the file
     * @param name {string} name of the file
     * @returns {Promise<void>}
     */
    const addDemoFile = async (path, name) => {
        const {fileData, ...fileDetails} = await readNewDemoStatementFile(path, name);
        await insertFile(fileDetails, fileData);
        setNbRecord(await countRecords());
    }

    /**
     * Delete a file and its records from IndexDB
     * @param fileId {int}
     * @returns {Promise<void>}
     */
    const removeFile = async fileId => {
        await deleteFile(fileId);
    }

    return {
        files,
        fileMap,
        addFile,
        addDemoFile,
        removeFile,
        nbRecords,
    }
}

export default useFiles;
