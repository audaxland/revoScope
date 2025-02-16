import {useEffect, useState} from "react";
import {Button} from "@material-tailwind/react";
import IconButton from "../../elements/buttons/IconButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose} from "@fortawesome/free-solid-svg-icons";
import demoEuro from '../../assets/demoFiles/demo_eur.csv';
import demoBtc from '../../assets/demoFiles/demo_btc.csv';
import {exportLocalFile} from "../../lib/exportHelper";
import useFiles from "../../hooks/useFiles";
import {useSettingsContext} from "../../store/SettingsContext";

/**
 * Renders the feature to load the demo files in the app, when the user does not have statement files from revolut
 * @param filesCount {number} number of statement files already loaded in the app *
 *                          (if more than zero, we prevent loading the demo files)
 * @returns {JSX.Element}
 * @constructor
 */
const DemoFilesSection = ({filesCount}) => {
    const [toggle, setToggle] = useState(false);
    const {addDemoFile} = useFiles();
    const {changeReferenceCurrency} = useSettingsContext();

    /* Close the demo menu once any file is loaded */
    useEffect(() => {setToggle(false)}, [filesCount]);

    return (
        <div className="mb-5 text-center">
            {(!toggle) && (
                <div >
                    {filesCount > 0 || (
                        <span>No statement files ?</span>
                    )}
                    <button
                        className="text-blue-700 font-bold px-3"
                        onClick={() => setToggle(old => !old)}
                    >
                        Click here for with demo statement files.
                    </button>
                </div>
            ) }

            {toggle && (
                <div className="p-3 mt-3 rounded-lg bg-white/20 flex flex-col lg:flex-row gap-3 justify-center items-center">
                    <Button
                        className="text-xs"
                        variant="outlined"
                        size="sm"
                        onClick={() => exportLocalFile({path: demoEuro, type: "text/csv;charset=utf-8;", filename: 'demo_euro.csv'})}
                    >
                        Download demo EURO Statement
                    </Button>
                    <Button
                        className="text-xs"
                        variant="outlined"
                        size="sm"
                        onClick={() => exportLocalFile({path: demoBtc, type: "text/csv;charset=utf-8;", filename: 'demo_btc.csv'})}
                    >
                        Download demo BTC Statement
                    </Button>
                    {filesCount > 0 || (
                        <Button
                            onClick={() => {
                                changeReferenceCurrency("EUR");
                                addDemoFile(demoBtc, 'demo_btc.csv');
                                addDemoFile(demoEuro, 'demo_eurcsv');
                            }}
                        >
                            Load demo statements files in the app
                        </Button>
                    )}

                    <IconButton className="text-gray-600" onClick={() => setToggle(false)}>
                        <FontAwesomeIcon icon={faClose} />
                    </IconButton>
                </div>
            )}
        </div>
    );
}

export default DemoFilesSection;
