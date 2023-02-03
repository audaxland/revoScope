import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faFolder,
    faFileInvoiceDollar,
    faArrowsRotate,
    faPiggyBank,
    faHandHoldingDollar, faLinkSlash, faMoneyBillTransfer, faBookSkull, faSliders
} from '@fortawesome/free-solid-svg-icons'
import OverviewPage from "./pages/OverviewPage";
import FilesPage from "./pages/FilesPage";
import Records from "./pages/Records";
import ExchangesPairedPage from "./pages/ExchangesPairedPage";
import ExchangesOrphanPage from "./pages/ExchangesOrphanPage";
import AccountsPage from "./pages/AccountsPage";
import GainsPage from "./pages/GainsPage";
import TransactionsPage from "./pages/TransactionsPage";
import Form8949Page from "./pages/Form8949Page";
import SettingsPage from "./pages/SettingsPage";

const appRoutes = [
    {
        title: "Overview",
        path: "overview",
        icon: <FontAwesomeIcon icon={faHouse} />,
        page: <OverviewPage />,
    },
    {
        title: "Settings",
        path: "settings",
        icon: <FontAwesomeIcon icon={faSliders} />,
        page: <SettingsPage />,
    },
    {
        title: "Files",
        path: "files",
        icon: <FontAwesomeIcon icon={faFolder} />,
        page: <FilesPage />,
    },
    {
        title: "Records",
        path: "records",
        icon: <FontAwesomeIcon icon={faFileInvoiceDollar} />,
        page: <Records />,
    },
    {
        title: "Orphan Exchanges",
        path: "exchanges-orphan",
        icon: <FontAwesomeIcon icon={faLinkSlash} />,
        page: <ExchangesOrphanPage />,
    },
    {
        title: "Exchange Pairs",
        path: "exchanges-pairs",
        icon: <FontAwesomeIcon icon={faArrowsRotate} />,
        page: <ExchangesPairedPage />,
    },
    {
        title: "Transactions",
        path: "transactions",
        icon: <FontAwesomeIcon icon={faMoneyBillTransfer} />,
        page: <TransactionsPage />,
    },
    {
        title: "Accounts",
        path: "accounts",
        icon: <FontAwesomeIcon icon={faPiggyBank} />,
        page: <AccountsPage />,
    },
    {
        title: "Sales Gains",
        path: "sales-gains",
        icon: <FontAwesomeIcon icon={faHandHoldingDollar} />,
        page: <GainsPage />,
    },
    {
        title: "Form 8949",
        path: "form-8949",
        icon: <FontAwesomeIcon icon={faBookSkull} />,
        page: <Form8949Page />,
    },

];

export default appRoutes;
