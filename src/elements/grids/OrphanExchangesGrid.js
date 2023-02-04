import {useFileContext} from "../../store/FilesContext";
import {useEffect, useMemo, useRef, useState} from "react";
import GridWithControl from "./parts/GridWithControl";
import AlertErrors from "../alerts/AlertErrors";
import DefaultButton from "../buttons/DefaultButton";
import {getRecordByKey} from "../../store/dbRecords";
import {setManualPair} from "../../store/dbManualPairs";
import NoData from "./parts/NoData";

const OrphanExchangesGrid = () => {
    const {orphanExchanges, fileMap, updateExchanges} = useFileContext();
    const [orphanRows, setOrphanRows] = useState([]);
    const [errors, setErrors] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    const gridRef = useRef();

    useEffect(() => {
        (async () => {
            const newRows = await Promise.all(orphanExchanges.map(async (key) => {
                return await getRecordByKey(key);
            }))
            setOrphanRows(newRows);
        })();
    }, [orphanExchanges])

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

    const showError = message => {
        setErrors([message]);
        setTimeout(() => setErrors([]), 5000);
    }

    const onRowSelected = (row) => {
        const rowsSelected = row?.api?.getSelectedRows();
        setSelectedRows(rowsSelected ?? []);
        if ((!rowsSelected) || (rowsSelected.length < 2)) {
            return;
        }
        if (rowsSelected.length > 2) {
            showError( 'You can only select two rows at once');
            row.node.setSelected(false);
            return;
        }
        if (rowsSelected[0].Currency === rowsSelected[1].Currency) {
            showError( 'You can only select rows that have different currencies');
            row.node.setSelected(false);
            return;
        }
        if (rowsSelected[0].Amount * rowsSelected[1].Amount > 0) {
            showError( 'You can only select rows that have different amount signs');
            row.node.setSelected(false);
            return;
        }
    }

    const pairSelectedRows = async () => {
        if (selectedRows.length !== 2) return; // this should never happen
        if (!await setManualPair(selectedRows[0].key, selectedRows[1].key)) {
            showError('Something went wrong...');
            return;
        }
        await updateExchanges();
    }

    if ((!orphanRows) || (!Object.keys(fileMap).length)) {
        return <NoData />;
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
