import BulletLi from "../../elements/lists/BulletLi";
import TitledBox from "../../elements/boxes/TitledBox";
import BlueLink from "../../elements/buttons/BlueLink";

/**
 * Renders the Usage section of the overview page
 * @returns {JSX.Element}
 * @constructor
 */
const UsageSection = () => {
    return (
        <TitledBox title="How it works">
            <p>Before you can use this app, you must download your revolut statements form you revolut account.</p>
            <div>
                To use the app, you must:
                <ul className="text-sm">
                    <BulletLi>
                        Go to <a href="https://www.revolut.com/" target='_blank' className="text-blue-800" rel="noreferrer" >
                        https://www.revolut.com/
                    </a>
                    </BulletLi>
                    <BulletLi> Log in</BulletLi>
                    <BulletLi> Go on the account you used to buy and sell your crypto assets (eg EUR, USD, GBP...)</BulletLi>
                    <BulletLi>
                        Generate a statement on that account using the "Excel" (actually csv) format and make sure
                        the date range selected includes the entire period since your first purchase of crypto assets
                        (that will probably include several years)
                    </BulletLi>
                    <BulletLi>
                        Go on each crypto account you have and generate a "Excel" (actually csv) statement
                        using a date range that includes all the transactions you have ever had on that account
                    </BulletLi>
                    <BulletLi>
                        On the RevoGains app, go to the <BlueLink to='/settings'>"Settings" page </BlueLink>
                        to set your "local" fiat currency (the currency you used to buy/sell the crypto assets)
                    </BulletLi>
                    <BulletLi>
                        On the RevoGains app, go to the <BlueLink to='/files'>"Files" page </BlueLink>
                        and there upload all your statements from the revolut app
                    </BulletLi>
                    <BulletLi>
                        If all went well, you can go to the <BlueLink to='/form-8949'>"Form 8949" page </BlueLink>
                        and download your tax forms
                    </BulletLi>
                    <BulletLi>
                        You can check for errors or issues by looking through the individual transactions on the <BlueLink to='/transactions'>"Transactions" page </BlueLink>,
                        and the <BlueLink to='/exchanges-orphan'>"Orphan Exchanges" page </BlueLink>
                    </BulletLi>
                </ul>
            </div>
        </TitledBox>
    );
}

export default UsageSection;
