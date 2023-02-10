import Alert from "./Alert";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";

/**
 * Alert box for error messages
 * @param errors {string|string[]} error message/messages
 * @param rest {onClose: function, children: JSX.Element} props for the <Alert /> component
 * @see Alert
 * @returns {JSX.Element}
 * @constructor
 */
const AlertErrors = ({errors, ...rest}) => (
    <Alert
        message={errors}
        colorClasses="bg-red-100 border border-red-900 text-red-900"
        icon={<FontAwesomeIcon icon={faTriangleExclamation} />}
        {...rest}
    />
)

export default AlertErrors;
