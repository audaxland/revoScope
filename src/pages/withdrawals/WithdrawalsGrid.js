import GridWithControl from "../../elements/grids/GridWithControl";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useFileContext} from "../../store/FilesContext";
import gridHelpFile from './withdrawalsGridHelp.yml';
import DefaultButton from "../../elements/buttons/DefaultButton";
import {cleanDecimal} from "../../elements/grids/gridHelper";

/**
 * Renders the "Withdrawals" grid
 * @returns {JSX.Element}
 * @constructor
 */
const WithdrawalsGrid = () => {
    /**
     * @type {{fileMap: Object}} the map of file ids to their corresponding file name
     */
    const {accounts} = useFileContext();

    /**
     * @type {[Object[], function]} rowData : the list of withdrawals to render in the grid
     */
    const [rowData, setRowData] = useState([]);

    /**
     * @type {[boolean, function]} withPurchases: if true the grid contains both the withdrawals and purchases (one line per purchase)
     *                                            if false, the grid contains only the withdrawals (one line per withdrawals)
     */
    const [withPurchases, setWithPurchases] = useState(true);

    // prepare the data to be rendered
    useEffect(() => {
        const newRowData = [];
        Object.values(accounts).forEach(account => {
            // if withPurchases is true, each row will contain both the withdrawal and one purchase
            // so there can be multiple rows with the same withdrawal data, as one withdrawal can have multiple purchases
            newRowData.push(...account.listWithdrawals(withPurchases));
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
     * @type {function} rowSpan: for withdrawals with multiple purchases, the rowspan prevents rendering multiple times the withdrawal
     */
    const rowSpan = useCallback(
        ({data}) => withPurchases ? (data.purchaseIndex ? 1 : data.purchases) : 1,
        [withPurchases]
    );

    /**
     * @type {function} cellStyle: for withdrawals with multiple purchases, the rowspan prevents displaying multiple times the withdrawals
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
            {field: 'amount', rowSpan, cellStyle, valueGetter: cleanDecimal('cryptoAmount') },
            {field: 'balanceToDate', filter: 'agNumberColumnFilter', hide: true, valueGetter: cleanDecimal('balanceToDate')},
            {field: 'fiatValue', rowSpan, cellStyle, valueGetter: cleanDecimal('localAmount')  },
            {field: 'fiatCurrency', rowSpan, cellStyle, hide: true },
            {field: 'totalCost', rowSpan, cellStyle, valueGetter: ({data}) => data.totalCost?.toFixed(2) },
            {field: 'cost', rowSpan, cellStyle, valueGetter: ({data}) => data.cost?.toFixed(2), hide: true  },
            {field: 'purchaseFeeValue', rowSpan, cellStyle, valueGetter: ({data}) => data.purchaseFeeValue?.toFixed(2), hide: true  },
            {field: 'withdrawalFeeValue', rowSpan, cellStyle, valueGetter: ({data}) => data.withdrawalFeeValue?.toFixed(2), hide: true  },
            {field: 'gain', rowSpan, cellStyle, valueGetter: ({data}) => data.gain?.toFixed(2) },
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
    ], [withPurchases, cellStyle, rowSpan]);

    return (
        <GridWithControl
            {...{
                rowData,
                columnDefs,
                getRowStyle,
                suppressRowTransform: true,
                gridName: 'withdrawals',
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
                            Withdrawals Only
                        </DefaultButton>
                        <DefaultButton
                            onClick={() => setWithPurchases(true)}
                            disabled={withPurchases}
                        >
                            Withdrawals With Purchases
                        </DefaultButton>
                    </div>
                </div>
            )}
        />
    );
}

export default WithdrawalsGrid;
