import {useLiveQuery} from "dexie-react-hooks";
import {db} from "../store/db";
import {useEffect, useState} from "react";
import {readNewStatementFile} from "../lib/readNewFile";
import {deleteFile, insertFile} from "../store/dbFiles";

const useFiles = () => {
    const files = useLiveQuery(() => db.files.toArray());
    const [fileMap, setFileMap] = useState({});

    useEffect(() => {
        if ((!files)) return;
        setFileMap(files.reduce((prev, curr) => {
            prev[curr.id] = curr.name;
            return prev;
        }, {}));
    }, [files]);

    const addFile = async file => {
        const {fileData, ...fileDetails} = await readNewStatementFile(file);
        await insertFile(fileDetails, fileData);
    }

    const removeFile = async fileId => {
        await deleteFile(fileId);
    }

    return {
        files,
        fileMap,
        addFile,
        removeFile,
    }
}

export default useFiles;
