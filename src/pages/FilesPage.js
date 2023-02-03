import {useState} from "react";
import AlertErrors from "../elements/alerts/AlertErrors";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileCirclePlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import DataList from "../elements/lists/DataList";
import BigFileButton from "../elements/buttons/BigFileButton";
import useFiles from "../hooks/useFiles";




const FilesPage = () => {
    const [errors, setErrors] = useState([]);
    const {files, addFile, removeFile} = useFiles();
    const handleAddFile = async e => {
        setErrors([]);
        try {
            if (!e.target?.files?.length) {
                throw new Error('No file selected');
            }
            for (const file of e.target.files) {
                try {
                    await addFile(file);
                } catch (error) {
                    setErrors(old => [...old, error.message]);
                }

            }
        } catch (error) {
            setErrors(old => [...old, error.message]);
        }

    }

    return (
        <div
            className="p-10"
        >
            <BigFileButton
                onChange={handleAddFile}
                icon={(<FontAwesomeIcon icon={faFileCirclePlus}  />)}
            >
                Add Revolut Statement File (.csv)
            </BigFileButton>

            <AlertErrors errors={errors} />

            {(!!files?.length) && (<DataList
                dataRows={files?.map((file) => ({
                    id: file.id,
                    name: file.name,
                    currency: Object.keys(file.currencies).join(', '),
                    dateFrom: file.fromStartDate.split(' ')[0],
                    dateTo: file.toStartDate.split(' ')[0],
                    count: file.count + ' / ' + file.exchanges,
                    deleteFile: () => removeFile(file.id),

                })) ?? []}
                titles={{
                    name: 'File Name',
                    currency: 'Currency',
                    dateFrom: 'From Date',
                    dateTo: 'To Date',
                    count: 'Records / Exchanges',
                }}
                actions={{
                    deleteFile: <FontAwesomeIcon icon={faTrash} />
                }}
            />)}
        </div>
    );
}

export default FilesPage;
