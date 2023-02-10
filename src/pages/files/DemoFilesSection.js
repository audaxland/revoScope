import {useState} from "react";
import {Button} from "@material-tailwind/react";
import IconButton from "../../elements/buttons/IconButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose} from "@fortawesome/free-solid-svg-icons";
import demoEuro from '../../assets/demoFiles/demo_eur.csv';
import demoBtc from '../../assets/demoFiles/demo_btc.csv';
import {exportLocalFile} from "../../lib/exportHelper";
import useFiles from "../../hooks/useFiles";
import {useSettingsContext} from "../../store/SettingsContext";

const DemoFilesSection = () => {
    const [toggle, setToggle] = useState(false);
    const {addDemoFile} = useFiles();
    const {changeReferenceCurrency} = useSettingsContext();
    return (
        <div className="mb-5 text-center">
            <div >
                No statement files ?
                <button
                    className="text-blue-700 font-bold px-3"
                    onClick={() => setToggle(old => !old)}
                >
                    Click here to try the app with demo files.
                </button>
            </div>
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
                    <Button
                        onClick={() => {
                            changeReferenceCurrency("EUR");
                            addDemoFile(demoBtc, 'demo_btc.csv');
                            addDemoFile(demoEuro, 'demo_eurcsv');
                        }}
                    >
                        Load demo statements files in the app
                    </Button>
                    <IconButton className="text-gray-600" onClick={() => setToggle(false)}>
                        <FontAwesomeIcon icon={faClose} />
                    </IconButton>
                </div>
            )}
        </div>
    );
}

export default DemoFilesSection;
