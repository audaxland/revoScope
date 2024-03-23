import {createContext, useContext, useEffect} from "react";
import useExchanges from "../hooks/useExchanges";
import useFiles from "../hooks/useFiles";
import useAccounts from "../hooks/useAccounts";
import useWithdrawals from "../hooks/useWithdrawals";

/**
 * The FilesContext contains all the data that is read and computed from the csv files
 * @type {React.Context<{records: Object[], updateExchanges: function, files: Object[], accounts: {}, orphanExchanges: string[], pairs: Pair[]}>}
 */
export const FilesContext = createContext({
    files: [],
    records: [],
    pairs: [],
    orphanExchanges: [],
    updateExchanges: () => {},
    accounts: {},
});

/**
 * The FilesContext provider, along with the state of the context
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
export const FilesContextProvider = ({children}) => {
    /**
     * @type {{files: Object[], fileMap: Object, nbRecords: number}}
     *          files: is the list of uploaded metadata read from IndexDB
     *          fileMap: is an object that maps the file ids to their corresponding file names
     *          nbRecords: number of record contained in the data base
     */
    const {files, fileMap, nbRecords} = useFiles();

    /**
     * @type {{updateExchanges: function, pairs: Pair[], orphanExchanges: string[]}}
     *       updateExchanges: re-computes all the records from IndexDB and re-crates the Pairs and orphans computed
     *       pairs: is the list of Pair instance computed
     *       orphanExchanges: is the list of keys of all EXCHANGE records that couldn't be paired
     */
    const {updateExchanges, pairs, orphanExchanges} = useExchanges();

    /**
     * @type {{updateWithdrawals : function}}
     *       updateWithdrawals : re-computes all the records from IndexDB to wind all withdrawals
     */
    const {updateWithdrawals} = useWithdrawals();

    /**
     * @type {{accounts: Object, updateAccounts: function}}
     *       accounts: contains all the Account instances using their currency as the object key
     *       updateAccounts: re-computes all the accounts based on the pairs available
     */
    const {accounts, updateAccounts} = useAccounts();

    // re-compute the exchange pairs when the number of records in the database has changed
    useEffect(() => {
        if (nbRecords) {
            (async () => {
                const {newPairs} = await updateExchanges();
                const newWithdrawals = await updateWithdrawals();
                // update the accounts each time the pairs list has changed
                updateAccounts({pairs: newPairs, withdrawals: newWithdrawals});
            })()
        }
    }, [nbRecords, updateExchanges, updateAccounts, updateWithdrawals])


    return (
        <FilesContext.Provider
            value={{
                files,
                fileMap,
                pairs,
                orphanExchanges,
                updateExchanges,
                accounts,
            }}
        >
            {children}
        </FilesContext.Provider>
    )
}

export const useFileContext = () => {
    return useContext(FilesContext);
}
