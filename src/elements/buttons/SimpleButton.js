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
