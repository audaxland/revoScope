import DataCell from "./DataCell";
import ActionCell from "./ActionCell";

/**
 * Renders a styled table with flex divs
 * @param dataRows {Object[]} data to render in the cells of the table
 * @param titles {Object} titles of the cells, associating the field name and the corresponding title
 * @param actions {Object} action buttons {<field>: <icon>} icons to render on each row
 * @returns {JSX.Element}
 * @constructor
 */
const DataList = ({dataRows, titles, actions}) => {
    return (
        <div
            className="flex flex-col border border-indigo-400 rounded my-8  min-w-[15em]"
        >
            {dataRows?.map((row, index) => (
                <div
                    key={row.id ?? index}
                    className={(index % 2 === 0 ? 'bg-blue-100 ' : 'bg-blue-50 ') + " hover:bg-indigo-200"}
                >
                    <div
                        className={"flex lg:flex-row flex-col"}
                    >
                        {(!!titles) && Object.entries(titles).map(([field, title]) => (
                            <DataCell title={title} key={field}>{row[field]}</DataCell>
                        ))}
                        {(!!actions) && Object.entries(actions).map(([field, icon]) => (
                            <ActionCell onClick={row[field]} color="gray-800" key={field}>
                                {icon}
                            </ActionCell>
                        ))}
                    </div>

                </div>
            ))}
        </div>
    );
}

export default DataList;
