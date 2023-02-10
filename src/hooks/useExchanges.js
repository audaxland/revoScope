import {useCallback, useEffect, useState} from "react";
import {computeExchanges} from "../lib/exchangesHelper";
import {useSettingsContext} from "../store/SettingsContext";

/**
 * useExchanges maps the EXCHANGE records into the corresponding pairs
 * each pair is made of two record, one in the local currency (eg EUR) and the other in the cryptocurrency (eg BTC)
 * @returns {{updateExchanges: ((function(): Promise<void>)), orphanExchanges: Object[], pairs: Pair[]}}
 */
const useExchanges = () => {
    /**
     * @type {[Pair[], function]} list of all the pairs matched from the statement files
     */
    const [pairs, setPairs] = useState([]);

    /**
     * @type {[string[], function]} list of EXCHANGE record keys that were not matched into a pair
     */
    const [orphanExchanges, setOrphanExchanges] = useState([]);

    /**
     * @type {referenceCurrency: string}} the local/base currency that the assets were bought and sold with
     */
    const {referenceCurrency} = useSettingsContext();

    /**
     * re-computes the Pair instances based on the records stored in IndexDB
     * @type {(function(): Promise<void>)}
     */
    const updateExchanges = useCallback(async () => {
        const {pairs: newPairs, orphans} = await computeExchanges({referenceCurrency});
        setPairs(newPairs);
        setOrphanExchanges(orphans);
    }, [referenceCurrency]);

    return {
        updateExchanges,
        pairs,
        orphanExchanges,
    }
}

export default useExchanges;
