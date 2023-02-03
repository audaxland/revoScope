import TwoDimensionTable from "./TwoDimensionTable";

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
