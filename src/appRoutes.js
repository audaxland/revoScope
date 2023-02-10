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
import FilesPage from "./pages/files/FilesPage";
import RecordsPage from "./pages/records/RecordsPage";
import ExchangePairesPage from "./pages/exchangePairs/ExchangePairesPage";
import OrphanExchangesPage from "./pages/orphanExchanges/OrphanExchangesPage";
import AccountsPage from "./pages/accounts/AccountsPage";
import GainsPage from "./pages/gains/GainsPage";
import TransactionsPage from "./pages/transactions/TransactionsPage";
import Form8949Page from "./pages/Form8949Page";
import SettingsPage from "./pages/SettingsPage";

/**
 * list of routes and their corresponding details
 * @type {[{
 *      title: string,
 *      path: string,
 *      icon: JSX.Element,
 *      page: JSX.Element,
 *      secondary: boolean
 * }]}
 *
 *      title: title of the page, both in the menu and the page header
 *      path: url used by react-router-dom
 *      icon: the icon of the page, both in the menu and the header
 *      page: the component to render for that page
 *      secondary: if true, displayed smaller in the menu
 */
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
        title: "RecordsPage",
        path: "records",
        icon: <FontAwesomeIcon icon={faFileInvoiceDollar} />,
        page: <RecordsPage />,
        secondary: true,
    },
    {
        title: "Orphan Exchanges",
        path: "exchanges-orphan",
        icon: <FontAwesomeIcon icon={faLinkSlash} />,
        page: <OrphanExchangesPage />,
        secondary: true,
    },
    {
        title: "Exchange Pairs",
        path: "exchanges-pairs",
        icon: <FontAwesomeIcon icon={faArrowsRotate} />,
        page: <ExchangePairesPage />,
        secondary: true,
    },
    {
        title: "Accounts",
        path: "accounts",
        icon: <FontAwesomeIcon icon={faPiggyBank} />,
        page: <AccountsPage />,
    },
    {
        title: "Transactions",
        path: "transactions",
        icon: <FontAwesomeIcon icon={faMoneyBillTransfer} />,
        page: <TransactionsPage />,
        secondary: true,
    },
    {
        title: "Sales Gains",
        path: "sales-gains",
        icon: <FontAwesomeIcon icon={faHandHoldingDollar} />,
        page: <GainsPage />,
        secondary: true,
    },
    {
        title: "Form 8949",
        path: "form-8949",
        icon: <FontAwesomeIcon icon={faBookSkull} />,
        page: <Form8949Page />,
    },
];

export default appRoutes;
