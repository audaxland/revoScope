const TwoDimensionTable = ({
        data,
        cornerCell = '',
        tableClassName = 'text-sm',
        headerClassNames = 'border border-indigo-500/50 bg-teal-600/20 ',
        cellClassName = 'border border-indigo-500/50 text-right px-3 py-2 bg-teal-100/2 0',
}) => {
    const rowNames = Object.keys(data);
    const columnNames = [...Object.values(data).reduce((prev, curr) => {
        Object.keys(curr).forEach(column => prev.add(column));
        return prev;
    }, new Set())];


    return (
        <table className={tableClassName}>
            <thead>
                <tr>
                    <td>{cornerCell}</td>
                    {columnNames.map(columnName => (
                        <th key={columnName} className={`${cellClassName} ${headerClassNames}`}>
                            {columnName}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rowNames.map(rowName => (
                    <tr key={rowName}>
                        <th className={`${cellClassName} ${headerClassNames}`}>
                            {rowName}
                        </th>
                        {columnNames.map(columnName => (
                            <td key={columnName} className={cellClassName}>
                                {data[rowName][columnName] ?? ''}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default TwoDimensionTable;
