import TitledBox from "../../elements/boxes/TitledBox";
import {useMemo, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileCirclePlus, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import BigFileButton from "../../elements/buttons/BigFileButton";
import AlertErrors from "../../elements/alerts/AlertErrors";
import DataList from "../../elements/lists/DataList";
import SimpleButton from "../../elements/buttons/SimpleButton";

/**
 * The external data section allows the user to upload additional records from elsewhere to include in the generated
 * form 8949 files, the external file must be provided as csv files with the columns corresponding to the columns from form 8949
 * @param taxYear {string|number} year selected for the forms 8949
 * @param addExternalFile {function} callback to handle a new csv upload
 * @param externalFiles {Object[]} list of files already uploaded
 * @param clearAllExternalFiles {function} a callback to clear all uploaded external files
 * @returns {JSX.Element}
 * @constructor
 */
const ExternalDataSection = ({taxYear, addExternalFile, externalFiles, clearAllExternalFiles}) => {
    /**
     * @type {{columns, values}} just sample data used to render the sample table
     */
    const demoCsvAddData = useMemo(() => {
        return {
            columns: ['checkbox', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
            values: [
                ['C', 'BTC 0.00123', `05/25/${taxYear}`, `10/30/${taxYear}`, '123.45', '100.05', '', '', '23.40'],
                ['F', 'BTC 0.00456', `01/23/${taxYear - 1}`, `12/30/${taxYear}`, '432.10', '450.10', '', '', '-18.00'],
            ]
        }
    }, [])

    /**
     * @type {[string[], function]} list of errors to display on the page
     */
    const [errors, setErrors] = useState([]);

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
                    await addExternalFile(file);
                } catch (error) {
                    setErrors(old => [...old, error.message]);
                }
            }
        } catch (error) {
            setErrors(old => [...old, error.message]);
        }
    }

    return (
        <TitledBox title="Add external data to the 8949 forms (Optional)">
            <div>
                If you wish to combine data from an external source in the generated form 8949 files,
                along with the data computed by RevoScope, you can do so by uploading the data as csv files
                with the following structure:
                <div className={"overflow-x-auto"}>
                    <table className="text-xs text-right text-gray-800 m-3">
                        <thead>
                        <tr>{demoCsvAddData.columns.map(k => (
                            <th key={k} className="border border-indigo-500/20 px-2 py-1">{k}</th>
                        ))}</tr>
                        </thead>
                        <tbody>
                        {demoCsvAddData.values.map((row, rowNumber) => (
                            <tr key={rowNumber}>{row.map((k, columnNumber) => (
                                <td key={columnNumber} className="border border-indigo-500/20 px-2 py-0.5">{k}</td>
                            ))}</tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>
            <div>
                <BigFileButton
                    onChange={handleAddFile}
                    icon={(<FontAwesomeIcon icon={faFileCirclePlus}  />)}
                >
                    Add External File for form 8949 (.csv)
                </BigFileButton>

                {(!!externalFiles.length) && (
                    <SimpleButton
                        onClick={clearAllExternalFiles}
                        className={ "bg-gray-200 border border-gray-700 text-gray-700 rounded-3xl px-6 py-1.5 " +
                            "hover:bg-red-100 border hover:border-red-900 hover:text-red-900" }
                    >
                        <div className={"flex flex-row items-center gap-5 px-3"}>
                            <span className="text-3xl"><FontAwesomeIcon icon={faTrashCan}  /></span>
                            <span>Clear all external files</span>
                        </div>

                    </SimpleButton>
                )}


                <AlertErrors errors={errors} />

                {(!!externalFiles?.length) && (
                    <DataList
                        dataRows={externalFiles?.map((file) => ({
                            id: file.id,
                            name: file.name,
                            records: Object.entries(file.countPerYear)
                                .map(([k,v]) => `${k}: ${v}`)
                                .join(', '),
                            size: `${Math.ceil(file.size/1024)} kb`
                        })) ?? []}
                        titles={{
                            name: 'File Name',
                            records: 'Records per year',
                            size: 'File size',
                        }}
                    />
                )}
            </div>
        </TitledBox>
    )
}

export default ExternalDataSection;
