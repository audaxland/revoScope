import IconButton from "../buttons/IconButton";

/**
 * Renders a wrapper for an IconButton used in the <DataList /> table
 * @param children {JSX.Element} content to render in the button
 * @param rest {Object} props that are passed on to the <button /> element
 * @returns {JSX.Element}
 * @constructor
 */
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
