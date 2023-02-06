const DataCell = ({title, children, className}) => (
    <div
        className={"px-3 py-1 flex-1 flex flex-row lg:flex-col " + className}
    >
        <div
            className="font-bold text-xs uppercase text-blue-gray-500 flex-1 lg:flex-none"
        >
            {title}
        </div>
        <div
            className="text-sm text-gray-800 font-bold flex-1 lg:flex-none"
        >
            {children}
        </div>
    </div>
);

export default DataCell
