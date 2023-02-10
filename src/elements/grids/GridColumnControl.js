import {useEffect, useMemo, useState} from "react";
import {resizeGrid} from "./gridHelper";

/**
 * Renders the "Set visible columns" drawer, to toggle the visibility of the columns of the grid
 * @param gridRef {React.MutableRefObject} reference to the grid to control
 * @returns {JSX.Element}
 * @constructor
 */
const GridColumnControl = ({gridRef}) => {
    /**
     * @type  {Object|null} columnApi: gird column api object (null until the grid is rendered)
     */
    const columnApi = gridRef?.current?.columnApi ?? null;

    /**
     * Hash to identify the grid when storing the column visibility settings in sessionStorage
     * @type {string|null} columnsHash: hash of the list of columns the gird has
     */
    const columnsHash = gridRef?.current?.props?.columnsHash ?? null;

    /**
     * @type {Object} columnsVisible: list of columns the gird with the true/false visibility state
     */
    const [columnsVisible, setColumnsVisible] = useState({});

    /**
     * @type {array} columns: array of column objects from the grid
     */
    const columns = useMemo(() => columnApi?.getAllGridColumns() ?? [], [columnApi]);

    // initializes the columnsVisible state with the actual visible/not visible state of the grid columns
    useEffect(() => {
        if (!columns.length) return; // on first render there may be no columns, until the grid is actually rendered
        setColumnsVisible(columns.reduce((prev, curr) => {
            prev[curr.getColId()] = curr.isVisible();
            return prev;
        }, {}));
    }, [columns]);

    /**
     * Visibility toggle handler, to handle the checking/unchecking of the list checkboxes
     * @param colId {string} id in the grid of the column to toggle the visibility
     * @returns {(function(*): void)|*}
     */
    const toggleVisible = colId => e => {
        columnApi.setColumnVisible(colId, e.target.checked)
        const newColumnsVisible = ({...columnsVisible, [colId]: e.target.checked});
        setColumnsVisible(newColumnsVisible);
        // save the new state in sessionStorage so that the same columns are visible when the user comes back to the same page
        sessionStorage.setItem('girdColumns_' + columnsHash, JSON.stringify(newColumnsVisible));
        resizeGrid(columnApi);
    }

    return (
        <div className="w-60">
            <h4
                className="font-bold text-lg text-center text-gray-800 mb-5"
            >
                Set visible columns
            </h4>
            {columns.map(column => (
                <div
                    key={column.getColId()}>
                    <label
                        className="hover:text-red-500 flex hover:bg-[#fff5] rounded pl-2"
                    >
                        <input
                            type="checkbox"
                            checked={columnsVisible?.[column.getColId()] ?? false}
                            onChange={toggleVisible(column.getColId())}
                            className="mr-3"
                        />
                        {columnApi.getDisplayNameForColumn(column)}
                    </label>

                </div>
            ))}
        </div>
    );
}

export default GridColumnControl;
