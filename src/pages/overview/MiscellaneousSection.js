import TitledBox from "../../elements/boxes/TitledBox";
import BulletLi from "../../elements/lists/BulletLi";
import BlueLink from "../../elements/buttons/BlueLink";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";

/**
 * Renders the Miscellaneous section of the overciew page
 * @returns {JSX.Element}
 * @constructor
 */
const MiscellaneousSection = () => {
    return (
        <TitledBox title="MiscellaneousSection ">
            <p>Other MiscellaneousSection information</p>
            <ul className="text-sm">
                <BulletLi>
                    This app is a Single Page Application, all your data is stored and computed on your browser.
                    No data is sent to the server, nor collected, nor shares with third parties.
                </BulletLi>
                <BulletLi>
                    You can delete the data you uploaded by clicking on the <FontAwesomeIcon icon={faTrash} /> icon
                    on the <BlueLink to="/files">"Files" page</BlueLink>.
                </BulletLi>
                <BulletLi>
                    This app was built by Nathanael Sirmons.
                </BulletLi>
            </ul>
        </TitledBox>
    );
}

export default MiscellaneousSection;
