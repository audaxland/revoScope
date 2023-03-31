import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowsLeftRightToLine,
    faCircleQuestion,
    faClose,
    faDownload,
    faGear
} from "@fortawesome/free-solid-svg-icons";
import {useState} from "react";
import GridColumnControl from "./GridColumnControl";
import IconButton from "../buttons/IconButton";
import GridDownloadControl from "./GridDownloadControl";
import {resizeGrid} from "./gridHelper";
import GridHelpDrawer from "./GridHelpDrawer";

/**
 * Vertical bar on the right of the grid with icons to control the grid, and handle the drawers
 * @param gridRef {React.MutableRefObject} reference to the gird that is controlled
 * @param gridHelpFile {string} url to the yaml file that contains the fields help drawer data
 * @param gridHelpObject {object} alternatively to the yaml file, the fields help drawer data can be provided as an object
 * @returns {JSX.Element}
 * @constructor
 */
const GridControlBar = ({gridRef, gridHelpFile, gridHelpObject}) => {
    /**
     * @type {JSX.Element|null} drawer: drawer content to render or null is there is no drawer to render
     */
    const [drawer, setDrawer] = useState(null);

    return (
        <div
            className="relative bg-blue-gray-700 flex flex-col gap-3 text-white px-1 py-3 w-9 items-center"
        >
            <IconButton
                onClick={() => setDrawer(old => old ? null : (<GridHelpDrawer gridHelpFile={gridHelpFile} gridHelpObject={gridHelpObject} />))}
            >
                <FontAwesomeIcon icon={faCircleQuestion} />
            </IconButton>
            <IconButton
                onClick={() => setDrawer(old => old ? null : (<GridColumnControl gridRef={gridRef} />))}
            >
               <FontAwesomeIcon icon={faGear} />
           </IconButton>
            <IconButton
                onClick={() => (gridRef?.current?.columnApi) && resizeGrid(gridRef.current.columnApi)}
            >
                <FontAwesomeIcon icon={faArrowsLeftRightToLine} />
            </IconButton>
            <IconButton
                onClick={() => setDrawer(old => old ? null : (<GridDownloadControl gridRef={gridRef} />))}
            >
                <FontAwesomeIcon icon={faDownload} />
            </IconButton>
            {drawer && (
                <div className='absolute top-0 right-9 bottom-0 w-screen flex flex-row'>
                    <div
                        className="flex-1"
                        onClick={() => setDrawer(null)}
                    />
                    <div
                        className="bg-gradient-to-r from-blue-gray-200 to-blue-gray-100 h-full top-0 right-9
                    px-3 py-5 border-l-2 border-gray-500 text-gray-800 overflow-y-auto "
                    >
                        <div className="absolute">
                            <IconButton
                                className="absolute top-0 -left-7 bg-gray-200 border-2 border-gray-600 text-xl"
                                onClick={() => setDrawer(null)}
                            >
                                <FontAwesomeIcon icon={faClose} />
                            </IconButton>
                        </div>

                        {drawer}
                    </div>
                </div>
            )}
        </div>
    );
}

export default GridControlBar;
