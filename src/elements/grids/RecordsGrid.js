import {useEffect, useMemo, useState} from "react";
import { useFileContext } from "../../store/FilesContext";
import GridWithControl from "./parts/GridWithControl";
import {getAllRecords} from "../../store/dbRecords";
import NoData from "./parts/NoData";

const RecordsGrid = () => {
    const {fileMap} = useFileContext();
    const [records, setRecords] = useState([]);

    useEffect(() => {
        (async () => {
            const newRecords = await getAllRecords();
            setRecords(newRecords);
        })()
    }, [])

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
    ], [fileMap]);


    if ((!records) || (!Object.keys(fileMap).length)) {
        return <NoData />;
    }
    return (
        <GridWithControl {...{
            rowData: records,
            columnDefs,
            gridName: 'Records',
        }} />
    );
}

export default RecordsGrid;
