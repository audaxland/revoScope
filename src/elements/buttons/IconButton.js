const IconButton = ({
                        children,
                        onClick,
                        color = 'gray-500',
                        hoverColor = 'pink-600',
                        hoverBg = "gray-100",
                        className = ''
}) => {
    return (
        <button
            onClick={onClick}
            className={
                `rounded-full h-7 w-7 flex items-center justify-center relative transition duration-300 hover:-top-0.5
                text-${color} hover:text-${hoverColor} hover:bg-${hoverBg} hover:shadow-lg hover:shadow-${hoverColor}
                ${className}`
            }
        >
            {children}
        </button>
    );
}

export default IconButton;
