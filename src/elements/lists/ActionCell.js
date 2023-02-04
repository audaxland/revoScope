import IconButton from "../buttons/IconButton";

const ActionCell = ({children, ...rest}) => {
    return (
        <div
            className="flex items-center justify-center p-3 text-gray-700"
        >
            <IconButton {...rest}>
                {children}
            </IconButton>
        </div>
    );
}

export default ActionCell;
