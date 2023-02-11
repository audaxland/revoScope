import WelcomeSection from "./WelcomeSection";
import DisclaimerSection from "./DisclaimerSection";
import UsageSection from "./UsageSection";
import PagesMenuSection from "./PagesMenuSection";
import MiscellaneousSection from "./MiscellaneousSection";

/**
 * Renders the home page (or "Overview" page)
 * @returns {JSX.Element}
 * @constructor
 */
const OverviewPage = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2">
            <WelcomeSection />
            <DisclaimerSection />
            <UsageSection />
            <PagesMenuSection />
            <MiscellaneousSection />
        </div>
    );
}

export default OverviewPage;
