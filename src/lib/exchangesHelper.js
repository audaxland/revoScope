import {getAllRecords} from "../store/dbRecords";
import {deleteManualPairById, getManualPair} from "../store/dbManualPairs";
import Pair from "../models/Pair";

/**
 * Computes all the pairs among exchanges that have the same date
 * a pair is made of two records that have the same 'Start date' which is in the format "YYYY-MM-DD HH:MM:SS"
 * there can be more than two records that have the same 'Start date' as there can be multiple transactions that
 * have occurred simultaneously
 * @param dateExchanges {Object[]} array of records that have the same "Start Date"
 * @param referenceCurrency {string} the name of local or base currency the assets were bought/sold with
 * @returns {{orphans: *[], pairs: *[]}}
 */
export const processDate = (dateExchanges, referenceCurrency) => {
    /**
     * @type {{orphans: string[], pairs: Pair[]}}
     *          pairs: contains the list of Pair instances of the pairs found
     *          orphans: the list of the key of the records that did not have a corresponding pair record
     */
    const result = {
        pairs: [],
        orphans: []
    }

    /**
     * @type {Object} the records grouped by currency
     */
    const currencyMap = dateExchanges.reduce((prev, curr) => {
        prev[curr.Currency] = [...(prev[curr.Currency] ?? []), {...curr}];
        return prev;
    }, {});

    const currencyCount = Object.keys(currencyMap).map(currency => ({
        currency, count: currencyMap[currency].length
    }));

    // the most common situation, when there are two records forming one only pair
    if ((dateExchanges.length === 2)
        && (currencyCount.length === 2)
        && (currencyCount[0].count === currencyCount[1].count)
        && currencyMap[referenceCurrency]) {
        result.pairs.push(new Pair({
            records: [...dateExchanges],
            matchedBy: 'date-time',
            referenceCurrency
        }));
        return result;
    }

    // case when there are transactions of the same currency that occurred simultaneously
    if ((dateExchanges.length % 2 === 0) && (currencyCount.length === 2) && currencyMap[referenceCurrency]) {
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

    // pairs not matched are orphans
    result.orphans.push(...dateExchanges.map(item => item.key))

    return result;
}

/**
 * Reads all the records from IndexDB and matches all the pairs it can
 * @param referenceCurrency {string} local or base currency the assets were bought/sold with
 * @returns {Promise<{orphans: string[], pairs: Pair[]}>}
 */
export const computeExchanges = async ({referenceCurrency}) => {
    const records = (await getAllRecords()).filter(({Type}) => Type === 'EXCHANGE') ?? [];
    const allExchanges = {};
    const pairs = [];
    const orphans = [];
    const manualPairs = {};

    // group the records by "Start Date" and isolate the records that are paired manually
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

    // create the Pair instances for the manual pairs
    for (const pairId of  Object.keys(manualPairs)) {
        if (manualPairs[pairId].length < 2 ) {
            // this case shouldn't happen normally, but can occur if there was an error while deleting a file
            if (!allExchanges[manualPairs[pairId][0]['Started Date']]) {
                allExchanges[manualPairs[pairId][0]['Started Date']] = [];
            }
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

    // create all the Pairs we can, based on the "Start Date" value
    Object.keys(allExchanges).forEach(startDate => {
        const dateResults = processDate(allExchanges[startDate], referenceCurrency);

        if (dateResults.pairs.length) pairs.push(...dateResults.pairs);
        if (dateResults.orphans.length) orphans.push(...dateResults.orphans);

        delete allExchanges[startDate];
    });

    // sort the pairs by date (the localKey start with the date)
    pairs.sort((a,b) => (
        a.localKey > b.localKey ? 1 : ( a.localKey < b.localKey ? -1 : 0)
    ));

    return {pairs, orphans}
}
