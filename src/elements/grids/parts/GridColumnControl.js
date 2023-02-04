import {useEffect, useMemo, useState} from "react";
import {resizeGrid} from "./gridHelper";

const GridColumnControl = ({gridRef}) => {
    const columnApi = gridRef?.current?.columnApi ?? null;
    const columnsHash = gridRef?.current?.props?.columnsHash ?? null;
    const [columnsVisible, setColumnsVisible] = useState({});
    const columns = useMemo(() => columnApi?.getAllGridColumns() ?? [], [columnApi]);

    useEffect(() => {
        if (!columns.length) return;
        setColumnsVisible(columns.reduce((prev, curr) => {
            prev[curr.getColId()] = curr.isVisible();
            return prev;
        }, {}));
    }, [columns]);

    const toggleVisible = colId => e => {
        columnApi.setColumnVisible(colId, e.target.checked)
        const newColumnsVisible = ({...columnsVisible, [colId]: e.target.checked});
        setColumnsVisible(newColumnsVisible);
        sessionStorage.setItem('girdColumns_' + columnsHash, JSON.stringify(newColumnsVisible));
        resizeGrid(columnApi);
    }

    return (
        <div>
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
