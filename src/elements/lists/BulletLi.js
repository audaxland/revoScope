/**
 * Renders an <li /> item that is styled with a pullet point
 * @param children {string|JSX.Element} content of the <li /> element
 * @param className {string} optional classes to aad to the <li /> element
 * @returns {JSX.Element}
 * @constructor
 */
const BulletLi = ({children, className = ''}) => {
    return (
        <li className={`list-disc ml-7 mb-2 ${className}`}>
            {children}
        </li>
    );
}

export default BulletLi;
