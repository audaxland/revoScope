import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose, faGear} from "@fortawesome/free-solid-svg-icons";
import {useState} from "react";
import GirdColumnControl from "./GirdColumnControl";
import IconButton from "../../buttons/IconButton";

const GridControlBar = ({gridRef}) => {
    const [drawer, setDrawer] = useState(null);
    return (
        <div
            className="relative bg-blue-gray-700 flex flex-col text-white px-1 py-3 w-9 items-center"
        >
           <div
            className="text-xl hover:text-pink-500 rounded-full hover:bg-gray-100 w-7 h-7 flex items-center
            justify-center"
            onClick={() => setDrawer(old => old ? null : (<GirdColumnControl columnApi={gridRef.current.columnApi ?? null}/>))}
           >
               <FontAwesomeIcon icon={faGear} />
           </div>
            {drawer && (
                <div className='absolute top-0 right-9 bottom-0 w-screen flex flex-row'>
                    <div
                        className="flex-1"
                        onClick={() => setDrawer(null)}
                    />
                    <div
                        className=" w-60 bg-gradient-to-r from-blue-gray-200 to-blue-gray-100 h-full top-0 right-9
                    px-3 py-5 border-l-2 border-gray-500 text-gray-800"
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
