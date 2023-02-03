
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
