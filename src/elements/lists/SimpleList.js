/**
 * Render a basic unordered list
 * @param items {string[]|JSX.Element[]} content of the list items
 * @returns {JSX.Element}
 * @constructor
 */
const SimpleList = ({items}) => {
    return (
        <ul>
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    );
}

export default SimpleList;
