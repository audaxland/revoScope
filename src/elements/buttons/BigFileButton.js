/**
 * Lage button that opens file upload prompt to upload files
 * @param icon {JSX.Element} optional icon to render on the button
 * @param children {string|JSX.Element} text (or element) to render inside the button
 * @param onChange {function} callback to call on file upload
 * @returns {JSX.Element}
 * @constructor
 */
const BigFileButton = ({icon, children, onChange}) => {
    return (
        <div
            className="inline-block"
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
                    type="file"
                    onChange={onChange}
                    multiple
                    className="hidden"
                />
            </label>
        </div>
    );
}

export default BigFileButton;
