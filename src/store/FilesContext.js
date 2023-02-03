import {createContext, useContext, useEffect} from "react";

import useExchanges from "../hooks/useExchanges";

import useFiles from "../hooks/useFiles";
import useAccounts from "../hooks/useAccounts";

export const FilesContext = createContext({
    files: [],
    records: [],
    pairs: [],
    orphanExchanges: [],
    updateExchanges: () => {},
});

export const FilesContextProvider = ({children}) => {
    const {files, fileMap} = useFiles();
    const referenceCurrency = 'EUR';
    const {updateExchanges, pairs, orphanExchanges} = useExchanges({referenceCurrency});
    const {accounts, updateAccounts} = useAccounts();

    useEffect(() => {
        updateAccounts(pairs);
    }, [pairs, updateAccounts]);



    const dummy = () => {

    }

    return (
        <FilesContext.Provider
            value={{
                files,
                fileMap,
                pairs,
                orphanExchanges,
                updateExchanges,
                accounts,
                dummy,
            }}
        >
            {children}
        </FilesContext.Provider>
    )
}


export const useFileContext = () => {
    return useContext(FilesContext);
}
