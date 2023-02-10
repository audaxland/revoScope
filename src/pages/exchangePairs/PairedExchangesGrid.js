import {useFileContext} from "../../store/FilesContext";
import {useEffect, useMemo, useState} from "react";
import GridWithControl from "../../elements/grids/GridWithControl";
import {getRecordByKey} from "../../store/dbRecords";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner, faTrash} from "@fortawesome/free-solid-svg-icons";
import {deleteManualPairByKey} from "../../store/dbManualPairs";
import gridHelpFile from './exchangesGridHelp.yml';

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
                const localRecord = await getRecordByKey(pair.localKey);
                const cryptoRecord = await getRecordByKey(pair.cryptoKey);

                return {
                    index,
                    date: localRecord.date,
                    'Started Date': localRecord['Started Date'],
                    CryptoCurrency: cryptoRecord.Currency,
                    CryptoAmount: cryptoRecord.Amount,
                    CryptoBalance: cryptoRecord.Balance,
                    CryptoFee: cryptoRecord.Fee,
                    CryptoFiles: cryptoRecord.files,
                    CryptoDescription: cryptoRecord.Description,
                    CryptoKey: cryptoRecord.key,
                    BaseCurrency: localRecord.Currency,
                    BaseAmount: localRecord.Amount,
                    BaseBalance: localRecord.Balance,
                    BaseFee: localRecord.Fee,
                    BaseFiles: localRecord.files,
                    BaseDescription: localRecord.Description,
                    BaseKey: localRecord.key,
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
        {field: 'CryptoCurrency'},
        {field: 'CryptoAmount'},
        {field: 'CryptoBalance', hide: true},
        {field: 'CryptoFee', hide: true},
        {
            field: 'CryptoFiles',
            valueGetter: ({data}) => data.CryptoFiles.map(id => fileMap[id] ?? '').join('|'),
            hide: true,
        },
        {field: 'CryptoDescription', hide: true},
        {field: 'CryptoKey', hide: true},
        {field: 'BaseCurrency'},
        {field: 'BaseAmount'},
        {field: 'BaseBalance', hide: true},
        {field: 'BaseFee', hide: true},
        {
            field: 'BaseFiles',
            valueGetter: ({data}) => data.BaseFiles.map(id => fileMap[id] ?? '').join('|'),
            hide: true,
        },
        {field: 'BaseDescription', hide: true},
        {field: 'BaseKey', hide: true},

    ], [fileMap]);


    return (
        <GridWithControl {...{
            rowData: pairRows,
            columnDefs,
            gridName: 'ExchangePairs',
            gridHelpFile,
        }} />
    );
}

export default PairedExchangesGrid;
