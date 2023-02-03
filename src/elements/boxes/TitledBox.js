const TitledBox = ({title, children}) => {
    return (
        <div className='m-5 p-5 flex flex-col gap-3 bg-white/50 rounded-lg shadow shadow-indigo-900/50'>
            <h2 className='text-xl font-bold border-b border-indigo-300/50 pb-5'>
                {title}
            </h2>
            {children}
        </div>
    );
}

export default TitledBox;
