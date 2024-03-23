import {useCallback, useState} from "react";
import Account from "../models/Account";
import Pair from "../models/Pair";
import Withdrawal from "../models/Withdrawal";

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
     * Sort function so sort pairs by date (the key starts with the data, and handles sorting records that have the same date and time)
     * @param a {object}
     * @param b {object}
     * @returns {number}
     */
    const cryptoKeySort = (a,b) => a.cryptoKey > b.cryptoKey ? 1 : (a.cryptoKey < b.cryptoKey ? -1 : 0);

    /**
     * @type {(function(Pair[]): void)} re-compute the accounts for the given pairs
     */
    const updateAccounts = useCallback(({pairs, withdrawals}) => {
        const newAccounts = {};

        const items = [...pairs, ...withdrawals].sort(cryptoKeySort);

        items.forEach(item => {
            const {currency, referenceCurrency} = item;
            // if the Account for the pair currency does not yet exits, create it first
            if (!newAccounts[currency]) {
                newAccounts[item.currency] = new Account({currency, referenceCurrency})
            }

            // add the pair to its corresponding Account
            if (item instanceof Pair) newAccounts[item.currency].addPair(item);
            if (item instanceof Withdrawal) newAccounts[item.currency].addWithdrawal(item);
        });

        setAccounts(newAccounts);
    }, []);

    return {
        updateAccounts,
        accounts,
    }
}

export default useAccounts;
