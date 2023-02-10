import {useFileContext} from "../../store/FilesContext";
import {useEffect, useMemo, useRef, useState} from "react";
import GridWithControl from "../../elements/grids/GridWithControl";
import AlertErrors from "../../elements/alerts/AlertErrors";
import DefaultButton from "../../elements/buttons/DefaultButton";
import {getRecordByKey} from "../../store/dbRecords";
import {setManualPair} from "../../store/dbManualPairs";
import gridHelpFile from './orphansGridHelp.yml';

/**
 * Renders the "Orphan Exchanges" grid
 * @returns {JSX.Element}
 * @constructor
 */
const OrphanExchangesGrid = () => {
    /**
     * @type {{orphanExchanges: Array, fileMap: Object, updateExchanges: function}}
     *      orphanExchanges: an array of the keys of record that are of type "EXCHANGE" and not matched to a corresponding pair record
     *      fileMap: map of file id to their corresponding file name, (record only contain the file id, and we want to render the file name here)
     *      updateExchanges: re-computes the pairs for all the record
     */
    const {orphanExchanges, fileMap, updateExchanges} = useFileContext();

    /**
     * @type {[orphanRows: Object[]]} orphanRows: the list of orphan record to render on the grid
     */
    const [orphanRows, setOrphanRows] = useState([]);

    /**
     * @type {[error: Array]} errors: list of errors to render to the user
     */
    const [errors, setErrors] = useState([]);

    /**
     * @type {[selectedRows: Array]} selectedRows: list of rows the user has selected
     */
    const [selectedRows, setSelectedRows] = useState([]);

    /**
     * @type {React.MutableRefObject} ref for the grid
     */
    const gridRef = useRef();

    // fetch the orphan exchange record from the IndexDb into the orphanRows state, to be rendered on the grid
    useEffect(() => {
        (async () => {
            const newRows = await Promise.all(orphanExchanges.map(async (key) => {
                return await getRecordByKey(key);
            }))
            setOrphanRows(newRows);
        })();
    }, [orphanExchanges])

    /**
     *
     * @type {Object} columns definition
     */
    const columnDefs = useMemo(() => [
        {headerName: 'Pair', checkboxSelection: true, maxWidth: 70, filter: false},
        {field: 'Started Date', sort: 'desc'},
        {field: 'Currency'},
        {
            field: 'Amount',
            filter: 'agNumberColumnFilter',
        },
        {
            field: 'Balance',
            filter: 'agNumberColumnFilter',
        },
        {field: 'Description' },
        {field: 'files', valueGetter: ({data}) => data.files.map(id => fileMap[id] ?? '').join('|') },
        {
            field: 'Fee',
            filter: 'agNumberColumnFilter',
            hide: true,
        },
        {field: 'Type', hide: true},
        {field: 'Completed Date', hide: true },
        {field: 'Product', hide: true },
        {field: 'State', hide: true },
        {field: 'id', hide: true },
        {field: 'key', hide: true },
    ], [fileMap]);

    /**
     * Sets an error message to be rendered for 5 seconds
     * @param message
     */
    const showError = message => {
        setErrors([message]);
        setTimeout(() => setErrors([]), 5000);
    }

    /**
     * Handles the selection of a row on the grid, this is for matching exchange pairs manually
     * Only two rows can be selected at any time, and they must be of different currencies
     * @param row
     */
    const onRowSelected = (row) => {
        const rowsSelected = row?.api?.getSelectedRows();
        setSelectedRows(rowsSelected ?? []);
        if ((!rowsSelected) || (rowsSelected.length < 2)) {
            return;
        }
        // a pair has to have two exchanges, so don't allow selecting more than two rows
        if (rowsSelected.length > 2) {
            showError( 'You can only select two rows at once');
            row.node.setSelected(false);
            return;
        }

        // a pair matches exchanges od two different currencies, so can't select two rows with the same currency
        if (rowsSelected[0].Currency === rowsSelected[1].Currency) {
            showError( 'You can only select rows that have different currencies');
            row.node.setSelected(false);
            return;
        }

        // a pair is a purchase and a sale so the amounts of the exchanges need to be of opposite sign
        if (rowsSelected[0].Amount * rowsSelected[1].Amount > 0) {
            showError( 'You can only select rows that have different amount signs');
            row.node.setSelected(false);
            return;
        }
    }

    /**
     * Handles pairing manually two selected rows
     * @returns {Promise<void>}
     */
    const pairSelectedRows = async () => {
        if (selectedRows.length !== 2) return; // this should never happen
        if (!await setManualPair(selectedRows[0].key, selectedRows[1].key)) {
            showError('Something went wrong...');
            return;
        }
        await updateExchanges();
    }

    return (
        <GridWithControl
            {...{
                gridRef,
                rowData: orphanRows,
                columnDefs,
                rowSelection: 'multiple',
                onRowSelected,
                gridName: 'OrphanExchanges',
                gridHelpFile,
            }}
            preGrid={(
                <div className='p-3'>
                    <div className='flex flex-row gap-2 items-center'>
                        <div className='font-bold text-lg text-blue-900'>Select rows to pair...</div>
                        <DefaultButton
                            disabled={selectedRows.length !== 2}
                            onClick={pairSelectedRows}
                        >
                            Pair selected rows
                        </DefaultButton>
                        <DefaultButton
                            onClick={() => gridRef?.current?.api?.deselectAll()}
                            disabled={selectedRows.length === 0}
                        >
                            Clear selection
                        </DefaultButton>

                        <div > {selectedRows.length} row(s) selected</div>
                    </div>
                    {(!!errors?.length) && (
                        <AlertErrors errors={errors} onClose={() => setErrors([])} />
                    )}
                </div>
            )}
        />
    );
}

export default OrphanExchangesGrid;
