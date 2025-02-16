import {useRef} from "react";

/**
 * Lage button that opens file upload prompt to upload files
 * @param icon {JSX.Element} optional icon to render on the button
 * @param children {string|JSX.Element} text (or element) to render inside the button
 * @param onChange {function} callback to call on file upload
 * @param autoClear {Boolean} if set to true, the input value is reset after the onChange function has completed
 * @returns {JSX.Element}
 * @constructor
 */
const BigFileButton = ({icon, children, onChange, autoClear = true}) => {
    /**
     * @type {React.MutableRefObject<null>} Reference to the file input tag
     */
    const fileInputRef = useRef(null);

    /**
     * Applies the onChange callback function and resets the input field value if autoClear is set to True
     * @param e
     * @returns {Promise<void>}
     */
    const handleOnChange = async e => {
        if ((!fileInputRef.current) || (!fileInputRef.current.value)) return
        await onChange(e);
        if (autoClear && fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <div
            className="inline-block mr-3"
        >
            <label
                className="text-md text-indigo-700 bg-gray-100 border-2 border-indigo-700 relative
                    flex items-center justify-center rounded-full px-6 py-1.5 gap-5
                    hover:text-pink-700 hover:border-pink-700 hover:bg-orange-100 hover:-top-0.5 hover:shadow hover:shadow-white
                    transition duration-300"
            >
                {(!!icon) && <span className="text-3xl" >{icon}</span>}
                <span>{children}</span>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleOnChange}
                    multiple
                    className="hidden"
                />
            </label>
        </div>
    );
}

export default BigFileButton;
