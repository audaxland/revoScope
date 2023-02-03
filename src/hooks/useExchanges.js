import {useCallback, useEffect, useState} from "react";
import {computeExchanges} from "../lib/exchangesHelper";
import {useSettingsContext} from "../store/SettingsContext";



let firstRender = true;

const useExchanges = () => {
    const [pairs, setPairs] = useState([]);
    const [orphanExchanges, setOrphanExchanges] = useState([]);
    const {referenceCurrency} = useSettingsContext();

    const updateExchanges = useCallback(async () => {
        const {pairs: newPairs, orphans} = await computeExchanges({referenceCurrency});

        setPairs(newPairs);
        setOrphanExchanges(orphans);
    }, [referenceCurrency]);

    useEffect(() => {
        // for some reason, this useEffect get ran twice, so manually prevent running update twice using firstRender
        if (!firstRender) return;
        updateExchanges();
        firstRender = false;
        // eslint-disable-next-line
    }, []);

    return {
        updateExchanges,
        pairs,
        orphanExchanges,
    }
}

export default useExchanges;
