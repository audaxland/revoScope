/**
 * Button render with an icon and styled with a circle hover effect
 * @param children {JSX.Element} content to render inside the button, expecting an icon here
 * @param onClick {function} callback to call on click event
 * @param className {string} additional classes to add to the button
 * @param rest {Any} other properties that will be passed on to the <button /> element
 * @returns {JSX.Element}
 * @constructor
 */
const IconButton = ({
    children,
    onClick,
    className = '',
    ...rest
}) => {
    return (
        <button
            onClick={onClick}
            className={
                `rounded-full h-8 w-8 flex items-center justify-center relative transition duration-300 text-lg 
                hover:-top-0.5 hover:text-pink-600 hover:bg-gray-100 hover:shadow-lg hover:shadow-text-pink-600
                ${className}`
            }
            {...rest}
        >
            {children}
        </button>
    );
}

export default IconButton;
