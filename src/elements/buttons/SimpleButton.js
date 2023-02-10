/**
 * Generic button rendered with basic styles
 * @param children {string|JSX.Element} what to render inside the button
 * @param className {string} optional additional classes to add to the button
 * @param rest {onClick|Any} other props to pass on to the <button /> element
 * @returns {JSX.Element}
 * @constructor
 */
const SimpleButton = ({children, className, ...rest}) => {
    return (
        <button
            className={`border px-3 py-1.5 rounded relative hover:-top-0.5 disabled:hover:top-0 ${className}`}
                {...rest}
        >
            {children}
        </button>
    );
}

export default SimpleButton;
