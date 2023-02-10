/**
 * Renders a box with a title and the children rendered as flex-wrap
 * @param title {string} title of the section
 * @param children {JSX.Element|JSX.Element[]} elements to render as flex-wrap
 * @returns {JSX.Element}
 * @constructor
 */
const FlexWrapSection = ({title, children}) => {
    return (
        <section className='flex flex-col gap-3 border-b border-indigo-300/50 pb-5'>
            <h4 className='font-bold'>{title}</h4>
            <div className='flex flex-wrap gap-3'>
                {children}
            </div>
        </section>
    );
}

export default FlexWrapSection;
