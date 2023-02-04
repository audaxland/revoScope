const IconButton = ({
                        children,
                        onClick,
                        className = ''
}) => {
    return (
        <button
            onClick={onClick}
            className={
                `rounded-full h-8 w-8 flex items-center justify-center relative transition duration-300 text-lg 
                hover:-top-0.5 hover:text-pink-600 hover:bg-gray-100 hover:shadow-lg hover:shadow-text-pink-600
                ${className}`
            }
        >
            {children}
        </button>
    );
}

export default IconButton;
