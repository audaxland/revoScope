import Sidebar from "./Sidebar";
import {Outlet, useLocation} from "react-router-dom";
import appRoutes from "../appRoutes";

/**
 * General Layout of the pages
 * @returns {JSX.Element}
 * @constructor
 */
const AppLayout = () => {
    /**
     * @type {{pathname: string}} current path from the url relative to the domain name
     */
    const {pathname} = useLocation();

    /**
     * @type {{title: string, icon: JSX.Element}} title: page title, icon: icon for the page
     */
    const {title, icon} = appRoutes.find(({path}) => pathname.endsWith(path)) || {};

    return (
        <div
            className="flex"
        >
            <Sidebar />
            <main
                className="flex-1 bg-gradient-to-br from-blue-100 to-purple-100 h-screen overflow-y-auto"
            >
                <header
                    className="flex justify-between text-white bg-gradient-to-r from-orange-600 to-pink-600
                    px-8 py-4 font-extrabold text-2xl"
                >
                    <h1>{title}</h1>
                    {icon}
                </header>
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;
