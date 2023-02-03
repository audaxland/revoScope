import Alert from "./Alert";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";

const AlertErrors = ({errors, ...rest}) => (
    <Alert
        message={errors}
        colorClasses="bg-red-100 border border-red-900 text-red-900"
        icon={<FontAwesomeIcon icon={faTriangleExclamation} />}
        {...rest}
    />
)

export default AlertErrors;
