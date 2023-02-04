import {AgGridReact} from "ag-grid-react";
import {resizeGrid} from "./gridHelper";
import GridControlBar from "./GridControlBar";
import {useCallback, useMemo, useRef, useState} from "react";
import md5 from "md5";

const GridWithControl = ({
     preGrid = null,
     gridRef = undefined,
     rowData,
     columnDefs,
     gridReady,
    ...rest
 }) => {
    const localRef = useRef();

    const [defaultColDef] = useState({
        filter: 'agTextColumnFilter',
        minWidth: 100,
        sortable: true,
        resizable: true,
    });

    const columnsHash = useMemo(() => md5(columnDefs.map(col => col.field).join('|')), [columnDefs])

    const onGridReady = useCallback(grid => {
        if (gridReady) gridReady(grid)
        const storedSettings = sessionStorage.getItem('girdColumns_' + columnsHash)
        if (storedSettings) {
            Object.entries(JSON.parse(storedSettings)).forEach(([colId, isVisible]) => {
                grid.columnApi.setColumnVisible(colId, isVisible);
            })
        }
    }, [columnsHash])

    return (
        <div className="flex flex-row">
            <div
                className="ag-theme-alpine flex-1 flex flex-col"
                style={{height: 'calc(100vh - 64px)'}}
            >
                {(!!preGrid) && (
                    <div>
                        {preGrid}
                    </div>
                )}
                <div className="flex-1">
                    <AgGridReact
                        ref={typeof gridRef === 'undefined' ? localRef : gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        enableCellTextSelection={true}
                        onFirstDataRendered={({columnApi}) => resizeGrid(columnApi)}
                        columnsHash={columnsHash}
                        onGridReady={onGridReady}
                        {...rest}
                    />
                </div>

            </div>
            <GridControlBar {...{rowData}} gridRef={typeof gridRef === 'undefined' ? localRef : gridRef} />
        </div>
    );
}

export default GridWithControl;
