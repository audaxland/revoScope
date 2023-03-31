import useYaml from "../../hooks/useYaml";

/**
 * Renders the columns definition helper drawer on grid pages.
 * @param gridHelpFile {string} The path the yaml file that contains the column definitions text.
 * @param gridHelpObject {Object} Alternately to the yaml file, an object that contains the column definitions text.
 * @returns {JSX.Element}
 * @constructor
 */
const GridHelpDrawer = ({gridHelpFile, gridHelpObject}) => {
    /**
     * @type {Object} yaml help file converted to an object
     */
    const yamlHelp = useYaml(gridHelpFile);

    /**
     * @type {{gridFields: Object}} list of {<field name>: <field definition>,...} definitions of the columns.
     */
    const {gridFields} =  gridHelpObject ?? yamlHelp;

    return (
        <div className="w-96">
            <h4
                className="font-bold text-lg text-center text-gray-800 mb-5"
            >
                Columns Definitions
            </h4>
            {(!!gridFields && Object.entries(gridFields).map(([field, description]) => (
                <div
                    key={field}
                    className="hover:text-red-500 flex flex-col hover:bg-[#fff5] rounded pl-2 my-3"
                >
                    <h5 className="font-bold text-sm">
                        {field}:
                    </h5>
                    <div className="text-xs pl-2 italic">
                        {(description ?? '').split('\n').map((line, index) => <p key={index}>{line}</p>)}
                    </div>

                </div>
            )))}
        </div>
    );
}

export default GridHelpDrawer;
