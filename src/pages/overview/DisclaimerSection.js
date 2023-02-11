import TitledBox from "../../elements/boxes/TitledBox";
import BulletLi from "../../elements/lists/BulletLi";

/**
 * Renders the disclaimer section of the overview page
 * @returns {JSX.Element}
 * @constructor
 */
const DisclaimerSection = () => {
    return (
        <TitledBox title="Disclaimer">
            <ul className="text-sm">
                <BulletLi className='font-bold'>
                    Caution: This app assumes that all cryptocurrency assets were acquired and sold using the same base currency.
                    If you you have used multiple currencies to buy and sell cryptocurrencies, the computed gains/losses will be wrong.
                </BulletLi>
                <BulletLi>
                    This App is provided without guaranties whatsoever. You ar still responsible for your own tax returns.
                </BulletLi>
                <BulletLi>
                    This App is neither affiliated, nor approved, nor endorsed by neither Revolut&trade; nor the IRS nor any tax/accounting/law firm.
                </BulletLi>
                <BulletLi>
                    This add does not guaranty compliance with any tax code.
                </BulletLi>
                <BulletLi>
                    The statement files provided by Revolut are not always consistent and can change format over time. So you need to check your data.
                </BulletLi>
                <BulletLi>
                    This app does not file your taxes for you. That is your own responsibility.
                </BulletLi>
                <BulletLi>
                    Neither the author of this App nor the host of the App may be liable for the use of this App nor any event resulting from the use this App.
                    This app may only be used at your own risk.
                </BulletLi>
                <BulletLi>
                    No support is provided for this app or the usage of this app.
                </BulletLi>
            </ul>
        </TitledBox>
    );
}

export default DisclaimerSection;
