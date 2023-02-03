import {useEffect, useMemo, useState} from "react";
import {resizeGrid} from "./gridHelper";

const GirdColumnControl = ({columnApi}) => {
    const [columnsVisible, setColumnsVisible] = useState({});

    const columns = useMemo(() => columnApi.getAllGridColumns(), [columnApi]);

    useEffect(() => {
        setColumnsVisible(columns.reduce((prev, curr) => {
            prev[curr.getColId()] = curr.isVisible();
            return prev;
        }, {}));
    }, [columns]);


    const toggleVisible = colId => e => {
        columnApi.setColumnVisible(colId, e.target.checked)
        setColumnsVisible(old => ({...old, [colId]: e.target.checked}));
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

export default GirdColumnControl;
