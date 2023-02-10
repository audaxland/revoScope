import {createContext, useContext, useState} from "react";

/**
 * The Settings Context hold global settings, here the only setting is the local or base currency
 * @type {React.Context<{referenceCurrency: string, changeReferenceCurrency: function}>}
 */
const SettingsContext = createContext({
    referenceCurrency: 'EUR',
    changeReferenceCurrency: () => {},
});

/**
 * The Provider for the settings context including the context state
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
export const SettingsContextProvider = ({children}) => {
    /**
     * @type {[string, function]} referenceCurrency: is the local or base currency used to buy/sell all the cryptocurrency assets
     */
    const [referenceCurrency, setReferenceCurrency] = useState(() => localStorage.getItem('referenceCurrency') ?? 'EUR');

    /**
     * handler to change the local or base currency
     * @param newCurrency
     */
    const changeReferenceCurrency = newCurrency => {
        setReferenceCurrency(newCurrency);
        localStorage.setItem('referenceCurrency', newCurrency);
    }

    return (
        <SettingsContext.Provider value={{
            referenceCurrency,
            changeReferenceCurrency
        }}>
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettingsContext = () => useContext(SettingsContext);
