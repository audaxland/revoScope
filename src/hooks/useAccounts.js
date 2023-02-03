import {useCallback, useState} from "react";
import Account from "../models/Account";

const useAccounts = () => {
    const [accounts, setAccounts] = useState({});

    const updateAccounts = useCallback(pairs => {
        const newAccounts = {};

        pairs.forEach(pair => {
            const {currency, referenceCurrency} = pair;
            if (!newAccounts[currency]) {
                newAccounts[pair.currency] = new Account({currency, referenceCurrency})
            }
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
