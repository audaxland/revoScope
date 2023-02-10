import {useCallback, useState} from "react";
import Account from "../models/Account";

/**
 * Handles the state of the Account instances
 * each Account instance contains the details of purchases and sales of a cryptocurrency class
 * @returns {{updateAccounts: ((function(*): void)|*), accounts: {}}}
 */
const useAccounts = () => {
    /**
     * @type {Object} Object of {<currency>: Account, ...} containing all the Account instances, one for each currency
     */
    const [accounts, setAccounts] = useState({});

    /**
     * @type {(function(Pair[]): void)} re-compute the accounts for the given pairs
     */
    const updateAccounts = useCallback(pairs => {
        const newAccounts = {};

        pairs.forEach(pair => {
            const {currency, referenceCurrency} = pair;
            // if the Account for the pair currency does not yet exits, create it first
            if (!newAccounts[currency]) {
                newAccounts[pair.currency] = new Account({currency, referenceCurrency})
            }

            // add the pair to its corresponding Account
            newAccounts[pair.currency].addPair(pair);
        });

        setAccounts(newAccounts);
    }, []);

    return {
        updateAccounts,
        accounts,
    }
}

export default useAccounts;
