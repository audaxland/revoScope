import {AgGridReact} from "ag-grid-react";
import {resizeGrid} from "./gridHelper";
import GridControlBar from "./GridControlBar";
import {useRef, useState} from "react";

const GridWithControl = ({
     preGrid = null,
     gridRef = undefined,
     rowData,
     columnDefs,
    ...rest
 }) => {
    const localRef = useRef();

    const [defaultColDef] = useState({
        filter: 'agTextColumnFilter',
        minWidth: 100,
        sortable: true,
        resizable: true,
    });

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
                        {...rest}
                    />
                </div>

            </div>
            <GridControlBar {...{rowData}} gridRef={typeof gridRef === 'undefined' ? localRef : gridRef} />
        </div>
    );
}

export default GridWithControl;
