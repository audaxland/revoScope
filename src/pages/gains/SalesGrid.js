import {useFileContext} from "../../store/FilesContext";
import GridWithControl from "../../elements/grids/GridWithControl";
import {useCallback, useEffect, useMemo, useState} from "react";
import DefaultButton from "../../elements/buttons/DefaultButton";
import {cleanDecimal} from "../../elements/grids/gridHelper";
import gridHelpFile from './gainsGridHelp.yml';

/**
 * Renders the "Sales Gain" grid
 * @returns {JSX.Element}
 * @constructor
 */
const SalesGrid = () => {
    /**
     * @type {{accounts: Object}} list of cryptocurrencies Accounts
     */
    const {accounts} = useFileContext();

    /**
     * @type {[Object[], function]} data to display on the grid
     */
    const [rowData, setRowData] = useState([]);

    /**
     * @type {[boolean, function]} withPurchases: if true the grid contains both the sales and purchases (one line per purchase)
     *                                            if false, the grid contains only the sales (one line per sale)
     */
    const [withPurchases, setWithPurchases] = useState(true);

    // prepare the data to be rendered
    useEffect(() => {
        const newRowData = [];
        Object.values(accounts).forEach(account => {
            // if withPurchases is true, each row will contain both the sale and one purchase
            // so there can be multiple rows with the same sale data, as one sale can have multiple purchases
            newRowData.push(...account.listSales(withPurchases));
        });

        newRowData.sort((a,b) => a.dateTime > b.dateTime ? 1 : (a.dateTime < b.dateTime ? -1 : 0))
        setRowData(newRowData);
    }, [accounts, withPurchases]);

    /**
     * @type {function} getRowStyle: controls the background color of the row depending on the currency of the row
     */
    const getRowStyle = useCallback(({data}) => {
        const deg = ((data.currency.toUpperCase().charCodeAt(0) - 65) * 12)
            + (data.currency.toUpperCase().charCodeAt(1) - 65)
            + Math.floor((data.currency.toUpperCase().charCodeAt(2) - 65)/2);
        return {background: `hsl(${deg}deg, 100%, 85%)`}
    }, []);

    /**
     * @type {function} rowSpan: for sale with multiple purchases, the rowspan prevents rendering multiple times the sale
     */
    const rowSpan = useCallback(
        ({data}) => withPurchases ? (data.purchaseIndex ? 1 : data.purchases) : 1,
        [withPurchases]
    );

    /**
     * @type {function} cellStyle: for sale with multiple purchases, the rowspan prevents displaying multiple times the sale
     */
    const cellStyle = useCallback(
        ({data}) => withPurchases && data.purchaseIndex ? {display: 'none'} : {},
        [withPurchases]
    );

    /**
     * @type {Object[]} definition of the columns of the grid
     */
    const columnDefs = useMemo(() => [
        ...[
            {field: 'id', filter: 'agNumberColumnFilter', rowSpan, cellStyle, hide: true },
            {field: 'year', filter: 'agNumberColumnFilter', rowSpan, cellStyle, hide: true  },
            {field: 'date', rowSpan, cellStyle },
            {field: 'dateTime', rowSpan, cellStyle, hide: true  },
            {field: 'currency', rowSpan, cellStyle },
            {field: 'sold', rowSpan, cellStyle, valueGetter: cleanDecimal('sold') },
            {field: 'soldFor', rowSpan, cellStyle },
            {field: 'localCurrency', rowSpan, cellStyle, hide: true  },
            {field: 'totalCost', rowSpan, cellStyle, valueGetter: ({data}) => data.totalCost?.toFixed(2) },
            {field: 'cost', rowSpan, cellStyle, valueGetter: ({data}) => data.cost?.toFixed(2), hide: true  },
            {field: 'purchaseFeeValue', rowSpan, cellStyle, valueGetter: ({data}) => data.purchaseFeeValue?.toFixed(2), hide: true  },
            {field: 'saleFeeValue', rowSpan, cellStyle, valueGetter: ({data}) => data.saleFeeValue?.toFixed(2), hide: true  },
            {field: 'gain', rowSpan, cellStyle, valueGetter: ({data}) => data.gain?.toFixed(2) },
            {field: 'cryptoAmount', rowSpan, cellStyle, hide: true  },
            {field: 'rateToCrypto', rowSpan, cellStyle, hide: true, valueGetter: cleanDecimal('rateToCrypto')},
            {field: 'rateToLocal', rowSpan, cellStyle, hide: true, valueGetter: cleanDecimal('rateToLocal')},
            {field: 'type', rowSpan, cellStyle, hide: true  },
            {field: 'purchases', rowSpan, cellStyle },
            {field: 'purchaseDates', valueGetter: ({data}) => data.purchaseDates.join('|'), rowSpan, cellStyle },
        ],
        ...(withPurchases ? [
            {field: 'purchaseItemDateTime'},
            {field: 'purchaseItemAmount', valueGetter: cleanDecimal('purchaseItemAmount')},
            {field: 'purchaseItemFor', valueGetter: ({data}) => data.purchaseItemFor?.toFixed(2)},
            {field: 'purchaseItemFeeValue', valueGetter: ({data}) => data.purchaseItemFeeValue?.toFixed(2)},
        ] : [])
    ], [withPurchases, rowSpan, cellStyle]);

    return (
        <GridWithControl
            {...{
                rowData,
                columnDefs,
                getRowStyle,
                suppressRowTransform: true,
                gridName: 'Sales',
                gridHelpFile,
            }}

            // preGrid is the top section above the grid, with the buttons to toggle the sale with/without the purchases
            preGrid={(
                <div className='p-3'>
                    <div className='flex flex-row gap-2 items-center'>
                        <DefaultButton
                            onClick={() => setWithPurchases(false)}
                            disabled={!withPurchases}
                        >
                            Sales Only
                        </DefaultButton>
                        <DefaultButton
                            onClick={() => setWithPurchases(true)}
                            disabled={withPurchases}
                        >
                            Sales With Purchases
                        </DefaultButton>
                    </div>
                </div>
            )}
        />
    );
}

export default SalesGrid;
