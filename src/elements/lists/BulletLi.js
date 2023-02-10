/**
 * Renders an <li /> item that is styled with a pullet point
 * @param children {string|JSX.Element} content of the <li /> element
 * @returns {JSX.Element}
 * @constructor
 */
const BulletLi = ({children}) => {
    return (
        <li className='list-disc ml-7'>
            {children}
        </li>
    );
}

export default BulletLi;
