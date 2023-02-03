import appRoutes from "../appRoutes";
import {NavLink} from "react-router-dom";
import { useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowCircleLeft, faBars} from "@fortawesome/free-solid-svg-icons";


const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(() => (localStorage.getItem('sidebar-collapse') === 'yes'));

    const toggleCollapsed = () => {
        setCollapsed(old => {
            localStorage.setItem('sidebar-collapse', old ? 'no' : 'yes');
            return !old;
        });
    }

    return (
        <aside
            className={`${collapsed ? 'w-14 ' : 'w-60 '} bg-gradient-to-r from-purple-700 to-blue-600 transition-all duration-300`}
        >
            <h1
                className="text-white font-extrabold text-3xl text-center p-3 flex flex-row gap-3 items-center justify-center"
            >
                <button onClick={toggleCollapsed}>
                    {(!collapsed) && (<FontAwesomeIcon icon={faArrowCircleLeft} />)}
                    {(!!collapsed) && (<FontAwesomeIcon icon={faBars} />)}
                </button>
                {(!collapsed) && (
                    <span className='flex-1'>RevoGains</span>
                )}
            </h1>
            <nav className="p-1">
                {appRoutes.map(({title, path, icon}) => (
                    <NavLink
                        className={({isActive}) => (
                            "flex flex-row justify-start items-center text-white px-3 py-2 gap-4 rounded-lg font-bold " +
                            "hover:bg-gradient-to-r from-orange-500 to-pink-600 m-1 hover:shadow-lg hover:shadow-blue-400 " +
                            (isActive ? 'bg-gradient-to-r ' : '')
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
