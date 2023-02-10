import TwoDimensionTable from "./TwoDimensionTable";

/**
 * Renders the totals summary table on the "Form 8949" page
 * @param shortTermTotals {Object} data for the short term investments totals
 * @param longTermTotals {Object} data for the long term investments totals
 * @param currency {string} name of the currency of the totals
 * @param rest {Object} additional props to be forwarded to the <TwoDimensionTable /> (mostly styles classes)
 * @returns {JSX.Element}
 * @constructor
 */
const Form8949TotalsTable = ({shortTermTotals, longTermTotals, currency, ...rest}) => {

    const data = {
        'Part I - Short Term': {
            'Total Sale Price': shortTermTotals.soldFor.toFixed(2) + ' ' + currency,
            'Total Cost': shortTermTotals.totalCost.toFixed(2) + ' ' + currency,
            'Total Gains': shortTermTotals.gain.toFixed(2) + ' ' + currency,
        },
        'Part II - Long Term': {
            'Total Sale Price': longTermTotals.soldFor.toFixed(2) + ' ' + currency,
            'Total Cost': longTermTotals.totalCost.toFixed(2) + ' ' + currency,
            'Total Gains': longTermTotals.gain.toFixed(2) + ' ' + currency,
        },
    };

    return (
        <TwoDimensionTable data={data} {...rest} />
    );
}

export default Form8949TotalsTable;
