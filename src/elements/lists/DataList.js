import DataCell from "./DataCell";
import ActionCell from "./ActionCell";

const DataList = ({dataRows, titles, actions}) => {
    return (
        <div
            className="flex flex-col border border-indigo-400 rounded my-8"
        >
            {dataRows?.map((row, index) => (
                <div
                    key={row.id ?? index}
                    className={(index % 2 === 0 ? 'bg-blue-100 ' : 'bg-blue-50 ') + " hover:bg-indigo-200"}
                >
                    <div
                        className={"flex md:flex-row flex-col"}
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
