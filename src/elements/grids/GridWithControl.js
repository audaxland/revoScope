import {AgGridReact} from "ag-grid-react";
import {resizeGrid} from "./gridHelper";
import GridControlBar from "./GridControlBar";
import {useCallback, useMemo, useRef, useState} from "react";
import md5 from "md5";
import styles from './gridStyles.module.css';

/**
 * The grid template that all the other grid pages are implementing
 * @param preGrid {JSX.Element} optional content to render above the grid
 * @param gridRef {React.MutableRefObject} optional reference for the gird, this allows the parent component to control the grid ref if needed elsewhere
 * @param rowData {Object[]} data to render on the grid
 * @param columnDefs {Object[]} definition of the columns of the grid
 * @param gridReady {function} optional callback to execute on the onGridReady event of the grid
 * @param gridHelpFile {string} the path to the grid help file
 * @param rest {*} any other props to pass on to the <AgGridReact /> element
 * @returns {JSX.Element}
 * @constructor
 */
const GridWithControl = ({
     preGrid = null,
     gridRef = undefined,
     rowData,
     columnDefs,
     gridReady,
     gridHelpFile,
    ...rest
 }) => {
    /**
     * @type {React.MutableRefObject} reference for the gird if not provided by the parent component
     */
    const localRef = useRef();

    /**
     * @type {[Object]} defaultColDef: default settings all column inherit unless theses are overwritten
     */
    const [defaultColDef] = useState({
        filter: 'agTextColumnFilter',
        minWidth: 50,
        sortable: true,
        resizable: true,
    });

    /**
     * @type {string} columnsHash: hash of the list of columns ids, this is used as an id of the grid when storing the column visibility state in sessionStorage
     */
    const columnsHash = useMemo(() => md5(columnDefs.map(col => col.field).join('|')), [columnDefs])

    /**
     * @type {function} callback executed when the grid is first rendered
     */
    const onGridReady = useCallback(grid => {
        if (gridReady) gridReady(grid)

        // read the column visibility from sessionStorage if available and apply the visibility to the grid
        const storedSettings = sessionStorage.getItem('girdColumns_' + columnsHash)
        if (storedSettings) {
            Object.entries(JSON.parse(storedSettings)).forEach(([colId, isVisible]) => {
                grid.columnApi.setColumnVisible(colId, isVisible);
            })
        }
    }, [columnsHash, gridReady])

    return (
        <div className={`flex flex-row`}>
            <div
                className="ag-theme-alpine flex-1 flex flex-col"
                style={{height: 'calc(100vh - 64px)'}}
            >
                {(!!preGrid) && (
                    <div>
                        {preGrid}
                    </div>
                )}
                <div className={`flex-1 ${styles.gridWrapper}`}>
                    <AgGridReact
                        ref={typeof gridRef === 'undefined' ? localRef : gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        enableCellTextSelection={true}
                        onFirstDataRendered={({columnApi}) => resizeGrid(columnApi)}
                        columnsHash={columnsHash}
                        onGridReady={onGridReady}
                        className={styles.grid}
                        {...rest}
                    />
                </div>

            </div>
            <GridControlBar {...{gridHelpFile}} gridRef={typeof gridRef === 'undefined' ? localRef : gridRef} />
        </div>
    );
}

export default GridWithControl;
