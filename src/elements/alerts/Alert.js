import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import SimpleButton from "../buttons/SimpleButton";

const Alert = ({
     message,
     colorClasses = 'bg-blue-100 border border-bue-900 text-blue-900 ',
     icon = (<FontAwesomeIcon icon={faInfoCircle} />),
     onClose = undefined,
     children
}) => {
    if (((!message) || (message.length === 0)) && (!children)) {
        return null;
    }

    if ((!!message) && !Array.isArray(message)) {
        message = [message];
    }

    return (
        <div className={"rounded-lg px-4 py-2 my-3 flex items-center " + colorClasses}>
            <i className="mx-2">{icon}</i>
            {(!!message) && (
                <ul
                    className="flex-1"
                >
                    {message.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            )}
            {(!!children) && <div className='flex-1'>{children}</div>}
            {(!!onClose) && (
                <SimpleButton
                    className={`${colorClasses}`}
                    onClick={onClose}
                >
                    Close
                </SimpleButton>
            )}
        </div>
    )

}

export default Alert;
