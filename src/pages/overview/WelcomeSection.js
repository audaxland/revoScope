import TitledBox from "../../elements/boxes/TitledBox";
import BlueLink from "../../elements/buttons/BlueLink";

/**
 * Renders the Welcome section of the Overview page
 * @returns {JSX.Element}
 * @constructor
 */
const WelcomeSection = () => {
    return (
        <TitledBox title="Welcome to the RevoGains app">
            <p>
                The RevoGains app is built to calculate the capital gains (or losses) on crypto currency trades
                made inside the Revolut&trade; app. And provide the corresponding Form 849 tax forms for filing the us taxes.
            </p>
            <p>
                In order to use the app, you first need to download statements from you accounts on the Recolut&trade; app,
                and upload them in the <BlueLink to="/files">"Files"</BlueLink> sections.
            </p>
            <p>
                If you wish to try the app without your own statement files, you can use demo files provided on the <BlueLink to="/files">"Files"</BlueLink> page.
            </p>
        </TitledBox>
    );
}

export default WelcomeSection;
