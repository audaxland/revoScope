import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import SimpleButton from "../buttons/SimpleButton";

/**
 * Renders an alert box with one or more messages
 * @param message {string|array} message or array of messages to render
 * @param colorClasses {string}  class names to add to the alert box/button, like tailwind text and background colors
 * @param icon {JSX.Element} icon to render on the left of the alert box
 * @param onClose {function} callback to call when clicking on the "close" button inside the alert box
 * @param children {JSX} optional children to display inside the alert box
 * @returns {JSX.Element|null}
 * @constructor
 */
const Alert = ({
     message,
     colorClasses = 'bg-blue-100 border border-bue-900 text-blue-900 ',
     icon = (<FontAwesomeIcon icon={faInfoCircle} />),
     onClose = undefined,
     children
}) => {
    // only render if there is something to render
    if (((!message) || (message.length === 0)) && (!children)) {
        return null;
    }

    // convert string message to array of messages
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
