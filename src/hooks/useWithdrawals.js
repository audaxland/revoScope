import {useCallback, useState} from "react";
import {useSettingsContext} from "../store/SettingsContext";
import {getAllRecords} from "../store/dbRecords";
import Withdrawal from "../models/Withdrawal";

/**
 * Handles the list of withdrawals that have been found in the csv files
 * @returns {{updateWithdrawals: (function(): Promise<Withdrawal[]>), withdrawals: *[]}}
 */
const useWithdrawals = () => {
    /**
     * @type {[withdrawals[], function]} list of all the withdrawals from the statement files
     */
    const [withdrawals, setWithdrawals] = useState([])

    /**
     * @type {referenceCurrency: string}} the local/base currency that the assets were bought and sold with
     */
    const {referenceCurrency} = useSettingsContext();

    /**
     * Finds all the withdrawals in the files
     * @type {function(): Promise<Withdrawal[]>}
     */
    const updateWithdrawals = useCallback(async () => {
        const records = (await getAllRecords()).filter(({Type}) => Type === 'CRYPTO_WITHDRAWAL') ?? [];
        const newWithdrawals = records.map(record => new Withdrawal({record, referenceCurrency}))
        setWithdrawals(newWithdrawals);
        return newWithdrawals;
    }, [referenceCurrency]);

    return {
        withdrawals,
        updateWithdrawals,
    }
}

export default useWithdrawals;