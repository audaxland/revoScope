import {useFileContext} from "../../store/FilesContext";
import {useEffect, useMemo, useState} from "react";
import GridWithControl from "./parts/GridWithControl";
import {getRecordByKey} from "../../store/dbRecords";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner, faTrash} from "@fortawesome/free-solid-svg-icons";
import {deleteManualPairByKey} from "../../store/dbManualPairs";

/**
 * Renders the "Matched by" cell of the grid, this includes a possible "delete" icon button to un-pair a manal pair
 * @param value {string} value of the cell content
 * @param data {object} the entire row data
 * @returns {JSX.Element}
 * @constructor
 */
const MatchedCell = ({value, data}) => {
    /**
     * @type {{updateExchanges: function}} updateExchanges: re-computes the all the pairs form all the exchanges
     */
    const { updateExchanges } = useFileContext();

    /**
     * @type {[deleting: boolean]} a flag to prevent deleting twice the row while the grid has not yet re-rendered
     */
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

/**
 * Renders the "Exchange Pairs" grid
 * @returns {JSX.Element}
 * @constructor
 */
const PairedExchangesGrid = () => {
    /**
     * @type {{pairs: Pair[], fileMap: Object}}
     *      pairs: array of all the pairs
     *      fileMap: objet that maps the file ids to their corresponding file name (exchanges/pairs only store the file id)
     */
    const { pairs, fileMap } = useFileContext();

    /**
     * @type {[Object[], function]}} pairRows: pair data to be rendered on the grid
     */
    const [pairRows, setPairRows] = useState([]);

    // generates the data to be rendered to the grid
    useEffect(() => {
        (async () => {
            const newRows = await Promise.all(pairs.map(async (pair, index) => {
                // here we fetch the data from IndexDb because the "files" field is not stored in the pair
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

    /**
     * @type {Object[]} list of columns definition
     */
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
            valueGetter: ({data}) => data.files_1.map(id => fileMap[id] ?? '').join('|'),
            hide: true,
        },
        {field: 'Currency_2'},
        {field: 'Amount_2'},
        {field: 'Balance_2', hide: true},
        {field: 'Fee_2', hide: true},
        {
            field: 'files_2',
            valueGetter: ({data}) => data.files_2.map(id => fileMap[id] ?? '').join('|'),
            hide: true,
        },
    ], [fileMap]);


    return (
        <GridWithControl {...{
            rowData: pairRows,
            columnDefs,
            gridName: 'ExchangePairs'
        }} />
    );
}

export default PairedExchangesGrid;
