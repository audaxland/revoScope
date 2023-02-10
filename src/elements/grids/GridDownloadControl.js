import {useEffect, useMemo, useState} from "react";
import {Button} from "@material-tailwind/react";
import moment from "moment/moment";
import {exportCsvFile} from "../../lib/exportHelper";

/**
 * Renders the drawer that allows downloading as a CSV file the content of the grid
 * @param gridRef {React.MutableRefObject} reference to the corresponding grid
 * @returns {JSX.Element}
 * @constructor
 */
const GridDownloadControl = ({gridRef}) => {
    /**
     * @type {[Object,function]} columnsSelected: {columnId: boolean} object listing all the columns with their selected/not-selected state
     */
    const [columnsSelected, setColumnsSelected] = useState({});

    /**
     * @type {Object|null} columnApi: the grid column api (or nul while the grid is not rendered)
     */
    const columnApi = gridRef?.current?.columnApi;

    /**
     * @type {Object[]} list of all columns from the grid
     */
    const columns = useMemo(() => columnApi?.getAllGridColumns() ?? [], [columnApi]);

    // initialize the columns selected to match the columns currently visible
    useEffect(() => {
        setColumnsSelected(columns.reduce((prev, curr) => {
            prev[curr.getColId()] = curr.isVisible();
            return prev;
        }, {}));
    }, [columns]);

    /**
     * Handle the selection of a column when clicking on the checkbox
     * @param colId
     * @returns {(function(*): void)|*}
     */
    const toggleSelected = colId => e => {
        setColumnsSelected(old => ({...old, [colId]: e.target.checked}));
    }

    /**
     * generates the csv file and make to browser download it
     */
    const downloadCsv = () => {
        /**
         * @type {Object[]} exportData: prepared array of data rows containing all the row there are and only the select fields
         */
        const exportData = (gridRef?.current?.props?.rowData ?? []).map(row => {
            return columns.filter(column => columnsSelected[column.getColId()])
                .reduce((prev,column) => {
                    prev[column.getColId()] = (column?.colDef?.valueGetter) ? column.colDef.valueGetter({data: row}) : row[column.colDef.field];
                    return prev;
                }, {});
        });

        /**
         * @type {string} filename: generate a default filename the browser will suggest for the file download
         */
        const filename = (gridRef?.current?.props?.girdName ?? 'RevoGainsExport') + '_' + (moment().format('YYYY-MM-DD_HH-mm-ss')) + '.csv';

        // generate the file and trigger the download
        exportCsvFile({exportData, filename});
    }

    return (
        <div className="w-60">
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
