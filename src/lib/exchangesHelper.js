import {getAllRecords} from "../store/dbRecords";
import {deleteManualPairById, getManualPair} from "../store/dbManualPairs";
import Pair from "../models/Pair";

export const processDate = (dateExchanges, referenceCurrency) => {
    const result = {
        pairs: [],
        orphans: []
    }

    const currencyMap = dateExchanges.reduce((prev, curr) => {
        prev[curr.Currency] = [...(prev[curr.Currency] ?? []), {...curr}];
        return prev;
    }, {});

    const currencyCount = Object.keys(currencyMap).map(currency => ({
        currency, count: currencyMap[currency].length
    }));


    if ((dateExchanges.length === 2) && (currencyCount.length === 2)) {
        result.pairs.push(new Pair({
            records: [...dateExchanges],
            matchedBy: 'date-time',
            referenceCurrency
        }));
        return result;
    }

    if ((dateExchanges.length % 2 === 0) && (currencyCount.length === 2)) {
        const [firstCurrency, secondCurrency] = Object.values(currencyMap);
        firstCurrency.sort(({Amount: a}, {Amount: b}) => (a > b) ? 1 : ((a < b) ? -1 : 0));
        secondCurrency.sort(({Amount: a}, {Amount: b}) => (a > b) ? 1 : ((a < b) ? -1 : 0));
        firstCurrency.forEach((item, index) => {
            result.pairs.push(new Pair({
                records: [firstCurrency[index], secondCurrency[index]],
                matchedBy: 'date-time',
                referenceCurrency,
            }));
        });
        return result;
    }

    result.orphans.push(...dateExchanges.map(item => item.key))

    return result;
}

export const computeExchanges = async ({referenceCurrency}) => {
    const records = (await getAllRecords()).filter(({Type}) => Type === 'EXCHANGE') ?? [];
    const allExchanges = {};
    const pairs = [];
    const orphans = [];
    const manualPairs = {};

    for (const record of records) {
        const manualPair = await getManualPair(record.key);
        if (manualPair) {
            if (!manualPairs[manualPair.id]) {
                manualPairs[manualPair.id] = [];
            }
            manualPairs[manualPair.id].push(record);
        } else {
            if (!allExchanges[record['Started Date']]) {
                allExchanges[record['Started Date']] = [];
            }
            allExchanges[record['Started Date']].push(record);
        }
    }

    for (const pairId of  Object.keys(manualPairs)) {
        if (manualPairs[pairId].length < 2 ) {
            allExchanges[manualPairs[pairId][0]['Started Date']].push(manualPairs[pairId][0]);
            await deleteManualPairById(pairId);
        } else {
            pairs.push(new Pair({
                records: [...manualPairs[pairId]],
                matchedBy: 'manual',
                referenceCurrency,
            }))
        }
    }

    Object.keys(allExchanges).forEach(startDate => {
        const dateResults = processDate(allExchanges[startDate], referenceCurrency);

        if (dateResults.pairs.length) pairs.push(...dateResults.pairs);
        if (dateResults.orphans.length) orphans.push(...dateResults.orphans);

        delete allExchanges[startDate];
    });

    pairs.sort((a,b) => (
        a.localKey > b.localKey ? 1 : ( a.localKey < b.localKey ? -1 : 0)
    ));

    return {pairs, orphans}
}
