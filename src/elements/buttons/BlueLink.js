import {Link} from "react-router-dom";

/**
 * Renders a link styled with blue text
 * @param children {string|JSX.Element} Text to display inside the link
 * @param className {string} optional additional classes to add to the link
 * @param rest {Object} other props to pass on to th <Link /> element
 * @returns {JSX.Element}
 * @constructor
 */
const BlueLink = ({children, className = "", ...rest}) => {
    return (
        <Link className={`text-blue-700 hover:text-blue-500 ${className}`} {...rest}>
            {children}
        </Link>
    );
}

export default BlueLink;
