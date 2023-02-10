import {useState} from "react";
import AlertErrors from "../../elements/alerts/AlertErrors";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileCirclePlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import DataList from "../../elements/lists/DataList";
import BigFileButton from "../../elements/buttons/BigFileButton";
import useFiles from "../../hooks/useFiles";
import DemoFilesSection from "./DemoFilesSection";

/**
 * Renders the "Files" page
 * @returns {JSX.Element}
 * @constructor
 */
const FilesPage = () => {
    /**
     * @type {[string[], function]} list of errors to display on the page
     */
    const [errors, setErrors] = useState([]);

    /**
     * @type {{files: Object[], addFile: function, removeFile: function}}
     *      files: the list of files uploaded, read from IndexDB
     *      addFile: callback function to add a new uploaded csv file
     *      removeFile: callback to remove a file from IndexDB
     */
    const {files, addFile, removeFile} = useFiles();

    /**
     * Handles the upload of a new csv file
     * @param e
     * @returns {Promise<void>}
     */
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
            <DemoFilesSection />
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
                    count: 'RecordsPage / Exchanges',
                }}
                actions={{
                    deleteFile: <FontAwesomeIcon icon={faTrash} />
                }}
            />)}
        </div>
    );
}

export default FilesPage;
