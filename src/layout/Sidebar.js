import appRoutes from "../appRoutes";
import {NavLink} from "react-router-dom";
import { useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowCircleLeft, faBars} from "@fortawesome/free-solid-svg-icons";

/**
 * Renders the sidebar menu
 * @returns {JSX.Element}
 * @constructor
 */
const Sidebar = () => {
    /**
     * @type {[boolean, function]} collapse state of the menu
     */
    const [collapsed, setCollapsed] = useState(() => (localStorage.getItem('sidebar-collapse') === 'yes'));

    const toggleCollapsed = () => {
        setCollapsed(old => {
            sessionStorage.setItem('sidebar-collapse', old ? 'no' : 'yes');
            return !old;
        });
    }

    return (
        <aside
            className={`${collapsed ? 'w-14 ' : 'w-60 '} bg-gradient-to-r from-purple-700 to-blue-600 transition-all duration-300 max-h-screen overflow-scroll`}
        >
            <h1
                className="text-white font-extrabold text-3xl text-center p-3 flex flex-row gap-3 items-center justify-center"
            >
                <button onClick={toggleCollapsed}>
                    {(!collapsed) && (<FontAwesomeIcon icon={faArrowCircleLeft} />)}
                    {(!!collapsed) && (<FontAwesomeIcon icon={faBars} />)}
                </button>
                {(!collapsed) && (
                    <span className='flex-1'>RevoScope</span>
                )}
            </h1>
            <nav className="p-1">
                {appRoutes.map(({title, path, icon, secondary = false}) => (
                    <NavLink
                        className={({isActive}) => (
                            "flex flex-row justify-start items-center text-white px-3 py-2 gap-4 rounded-lg font-bold " +
                            "hover:bg-gradient-to-r from-orange-500 to-pink-600 m-1 hover:shadow-lg hover:shadow-blue-400 " +
                            (isActive ? 'bg-gradient-to-r ' : '') +
                            (secondary ? 'text-sm ' : '') +
                            (secondary && !collapsed ? 'pl-8 py-1 ' : '')
                            )}
                        to={path}
                        key={path}
                    >
                        <div className='w-[15px] flex items-center justify-center'>
                            {icon}
                        </div>

                        {(!collapsed) && (
                            <div className='truncate'>{title}</div>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
