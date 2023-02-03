import SimpleButton from "./SimpleButton";

const DefaultButton = ({className, ...props}) => {
    return (
        <SimpleButton
            {...props}
            className={`bg-blue-600 text-white border border-blue-700 hover:bg-blue-200 hover:text-blue-900
            hover:shadow hover:shadow-blue-500 disabled:bg-blue-300 disabled:hover:bg-blue-300 
            disabled:hover:text-white disabled:hover:shadow-none ${className}`}
        />
    );
}

export default DefaultButton;
