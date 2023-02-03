import {createContext, useContext, useState} from "react";

const SettingsContext = createContext({
    referenceCurrency: 'EUR',
    changeReferenceCurrency: () => {},
});

export const SettingsContextProvider = ({children}) => {
    const [referenceCurrency, setReferenceCurrency] = useState(() => localStorage.getItem('referenceCurrency') ?? 'EUR');

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
