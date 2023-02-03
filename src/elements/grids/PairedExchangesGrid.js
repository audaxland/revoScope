import {useFileContext} from "../../store/FilesContext";
import {useEffect, useMemo, useState} from "react";
import GridWithControl from "./parts/GridWithControl";
import {getRecordByKey} from "../../store/dbRecords";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner, faTrash} from "@fortawesome/free-solid-svg-icons";
import {deleteManualPairByKey} from "../../store/dbManualPairs";
import NoData from "./parts/NoData";


const MatchedCell = ({value, data}) => {
    const { updateExchanges } = useFileContext();
    const [deleting, setDeleting] = useState(false);
    return (
        <>
            {value}
            {(value === 'manual') && (
                <button
                    className='mx-2 text-gray-700 relative hover:-top-0.5 hover:text-red-700'
                    onClick={() => {
                        setDeleting(true);
                        (async () => {
                            await deleteManualPairByKey(data.localKey)
                            await updateExchanges();
                        })();
                    }}
                    disabled={deleting}
                >
                    <FontAwesomeIcon icon={deleting ? faSpinner : faTrash} />
                </button>
            )}
        </>
    )
}

const PairedExchangesGrid = () => {
    const { pairs, fileMap } = useFileContext();
    const [pairRows, setPairRows] = useState([]);

    useEffect(() => {
        (async () => {
            const newRows = await Promise.all(pairs.map(async (pair, index) => {
                const raw = [
                    await getRecordByKey(pair.localKey),
                    await getRecordByKey(pair.cryptoKey),
                ];

                return {
                    index,
                    date: raw[0].date,
                    'Started Date': raw[0]['Started Date'],
                    Currency_1: raw[0].Currency,
                    Amount_1: raw[0].Amount,
                    Balance_1: raw[0].Balance,
                    Fee_1: raw[0].Fee,
                    files_1: raw[0].files,
                    Currency_2: raw[1].Currency,
                    Amount_2: raw[1].Amount,
                    Balance_2: raw[1].Balance,
                    Fee_2: raw[1].Fee,
                    files_2: raw[1].files,
                    ...pair,
                }
            }))
            setPairRows(newRows);
        })();
    }, [pairs]);

    const columnDefs = useMemo(() => [
        {
            field: 'matchedBy',
            cellRenderer: MatchedCell,
        },
        {
            field: 'date',
            valueGetter: ({data}) => data['Started Date'].split(' ')[0],
        },
        {field: 'Started Date', hide: true},
        {field: 'Currency_1'},
        {field: 'Amount_1'},
        {field: 'Balance_1', hide: true},
        {field: 'Fee_1', hide: true},
        {
            field: 'files_1',
            valueGetter: ({data}) => data.files_1.map(id => fileMap[id] ?? '').join(','),
            hide: true,
        },
        {field: 'Currency_2'},
        {field: 'Amount_2'},
        {field: 'Balance_2', hide: true},
        {field: 'Fee_2', hide: true},
        {
            field: 'files_2',
            valueGetter: ({data}) => data.files_2.map(id => fileMap[id] ?? '').join(','),
            hide: true,
        },
    ], [fileMap]);

    if (!pairRows.length) {
        return <NoData />
    }


    return (
        <GridWithControl {...{
            rowData: pairRows,
            columnDefs,
        }} />
    );
}

export default PairedExchangesGrid;
