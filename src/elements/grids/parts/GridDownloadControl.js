import {useEffect, useMemo, useState} from "react";
import {Button} from "@material-tailwind/react";
import moment from "moment/moment";
import {exportCsvFile} from "../../../lib/exportHelper";

const GridDownloadControl = ({gridRef}) => {
    const [columnsSelected, setColumnsSelected] = useState({});

    const columnApi = gridRef?.current?.columnApi;

    const columns = useMemo(() => columnApi?.getAllGridColumns() ?? [], [columnApi]);

    useEffect(() => {
        setColumnsSelected(columns.reduce((prev, curr) => {
            prev[curr.getColId()] = curr.isVisible();
            return prev;
        }, {}));
    }, [columns]);

    const toggleSelected = colId => e => {
        setColumnsSelected(old => ({...old, [colId]: e.target.checked}));
    }

    const downloadCsv = () => {
        const exportData = (gridRef?.current?.props?.rowData ?? []).map(row => {
            return columns.filter(column => columnsSelected[column.getColId()])
                .map(column => {
                    if (column?.colDef?.valueGetter) {
                        return column.colDef.valueGetter({data: row});
                    }
                    return row[column.colDef.field];
                })
        });
        const filename = (gridRef?.current?.props?.girdName ?? 'RevoGainsExport') + '_' + (moment().format('YYYY-MM-DD_HH-mm-ss')) + '.csv';
        exportCsvFile({exportData, filename});
    }

    return (
        <div>
            <h4
                className="font-bold text-lg text-center text-gray-800 mb-5"
            >
                Set columns to export
            </h4>
            {columns.map(column => (
                <div
                    key={column.getColId()}>
                    <label
                        className="hover:text-red-500 flex hover:bg-[#fff5] rounded pl-2"
                    >
                        <input
                            type="checkbox"
                            checked={columnsSelected?.[column.getColId()] ?? false}
                            onChange={toggleSelected(column.getColId())}
                            className="mr-3"
                        />
                        {columnApi?.getDisplayNameForColumn(column) ?? ''}
                    </label>

                </div>
            ))}
            {(!!gridRef?.current?.props) && (
                <div className='py-5 flex items-center justify-center'>
                    <Button onClick={downloadCsv}>Download CSV</Button>
                </div>

            )}
        </div>
    );
}

export default GridDownloadControl;
