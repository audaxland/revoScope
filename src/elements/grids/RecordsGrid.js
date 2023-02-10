import {useEffect, useMemo, useState} from "react";
import { useFileContext } from "../../store/FilesContext";
import GridWithControl from "./parts/GridWithControl";
import {getAllRecords} from "../../store/dbRecords";

/**
 * Renders the "Record" Grid
 * @returns {JSX.Element}
 * @constructor
 */
const RecordsGrid = () => {
    /**
     * @type {{fileMap: Object}} the map of file ids to their corresponding file name
     */
    const {fileMap} = useFileContext();

    /**
     * @type {[Object[], function]} records: the list of records to render in the grid
     */
    const [records, setRecords] = useState([]);

    // read the records from IndexDB
    useEffect(() => {
        (async () => {
            const newRecords = await getAllRecords();
            setRecords(newRecords);
        })()
    }, [])

    /**
     * @type {Object[]} definition of the columns of the grid
     */
    const columnDefs = useMemo(() => [
        {field: 'Currency'},
        {field: 'Type'},
        {
            field: 'Amount',
            filter: 'agNumberColumnFilter',
        },
        {
            field: 'date',
            valueGetter: ({data}) => data['Started Date'].split(' ')[0],
        },
        {
            field: 'Fee',
            filter: 'agNumberColumnFilter',
        },
        {
            field: 'Balance',
            filter: 'agNumberColumnFilter',
        },
        {field: 'files', valueGetter: ({data}) => data.files.map(id => fileMap[id] ?? '').join('|') },
        {field: 'Started Date', hide: true },
        {field: 'Completed Date', hide: true },
        {field: 'Description', hide: true },
        {field: 'Product', hide: true },
        {field: 'State', hide: true },
        {field: 'id', hide: true },
        {field: 'key', hide: true },
        {field: 'Fiat amount', hide: true },
        {field: 'Fiat amount (inc. fees)', hide: true, valueGetter: (row) => row.data['Fiat amount (inc. fees)'] },
        {field: 'Base currency', hide: true },
    ], [fileMap]);


    return (
        <GridWithControl {...{
            rowData: records,
            columnDefs,
            gridName: 'Records',
        }} />
    );
}

export default RecordsGrid;
