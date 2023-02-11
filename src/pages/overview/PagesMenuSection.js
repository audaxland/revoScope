import TitledBox from "../../elements/boxes/TitledBox";
import BulletLi from "../../elements/lists/BulletLi";
import BlueLink from "../../elements/buttons/BlueLink";

/**
 * Renders the PagesMenu section of the overview page
 * @returns {JSX.Element}
 * @constructor
 */
const PagesMenuSection = () => {
    return (
        <TitledBox title="Pages in the Menu">
            <p>This is a shot description of the different pages in the menu.</p>
            <ul className="text-sm">
                <BulletLi>
                    <p className="font-bold"><BlueLink to='/overview'>Overview:</BlueLink></p>
                    <p className="text-sm">The current page, with general information about the app.</p>
                </BulletLi>
                <BulletLi>
                    <p className="font-bold"><BlueLink to='/settings'>Settings:</BlueLink></p>
                    <p className="text-sm">The page where you select your local or base currency.</p>
                </BulletLi>
                <BulletLi>
                    <p className="font-bold"><BlueLink to='/files'>Files:</BlueLink></p>
                    <p className="text-sm">
                        The page where you can upload your statement files for each account you have on Revolut&trade;.
                    </p>
                </BulletLi>
                <BulletLi>
                    <p className="font-bold"><BlueLink to='/records'>Records:</BlueLink></p>
                    <p className="text-sm">
                        The records page show all the raw records that were read from the statement csv files you uploaded.
                        This allows you to check that the files were read properly.
                    </p>
                </BulletLi>
                <BulletLi>
                    <p className="font-bold"><BlueLink to='/exchanges-orphan'>Orphan Exchanges:</BlueLink></p>
                    <p className="text-sm">
                        Shows the list of "EXCHANGE" records that the app was unable to match to their corresponding other "EXCHANGE" record,
                        and this page allows you to match those records manually.
                    </p>
                    <p className="text-sm">
                        Each cryptocurrency transaction is made of two "EXCHANGE" records, one in your local/base currency and the other in the cryptocurrency.
                    </p>
                </BulletLi>
                <BulletLi>
                    <p className="font-bold"><BlueLink to='/exchanges-pairs'>Exchange Pairs:</BlueLink></p>
                    <p className="text-sm">
                        Shows the list of "EXCHANGE" records pairs that were matched. Each pair is a transaction.
                    </p>
                </BulletLi>
                <BulletLi>
                    <p className="font-bold"><BlueLink to='/accounts'>Accounts:</BlueLink></p>
                    <p className="text-sm">
                        Summary of the transactions and balance of each cryptocurrency grouped by year.
                    </p>
                </BulletLi>
                <BulletLi>
                    <p className="font-bold"><BlueLink to='/transactions'>Transactions:</BlueLink></p>
                    <p className="text-sm">
                        List of all the transactions found, including computed information about each transaction such as the gains, fee details and balance.
                        On this page you want to compare the "Crypto Balance" and "Balance To Date" columns, if they match the numbers should be correct,
                        and if they don't match that means there are missing transactions in the app.
                    </p>
                </BulletLi>
                <BulletLi>
                    <p className="font-bold"><BlueLink to='/sales-gains'>Sales Gains:</BlueLink></p>
                    <p className="text-sm">
                        List of all the sales of cryptocurrency with their corresponding purchases.
                    </p>
                </BulletLi>
                <BulletLi>
                    <p className="font-bold"><BlueLink to='/form-8949'>Form 8949:</BlueLink></p>
                    <p className="text-sm">
                        The page where you can generate the pages for Form 8949, populated with all the sales of the year.
                    </p>
                </BulletLi>
            </ul>
        </TitledBox>
    );
}

export default PagesMenuSection;
