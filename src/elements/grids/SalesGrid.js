import {useFileContext} from "../../store/FilesContext";
import GridWithControl from "./parts/GridWithControl";
import {useCallback, useEffect, useMemo, useState} from "react";
import DefaultButton from "../buttons/DefaultButton";

const SalesGrid = () => {
    const {accounts} = useFileContext();
    const [rowData, setRowData] = useState([]);
    const [withPurchases, setWithPurchases] = useState(true);

    useEffect(() => {
        const newRowData = [];
        Object.values(accounts).forEach(account => {
            newRowData.push(...account.listSales(withPurchases));
        });

        newRowData.sort((a,b) => a.dateTime > b.dateTime ? 1 : (a.dateTime < b.dateTime ? -1 : 0))
        setRowData(newRowData);
    }, [accounts, withPurchases]);

    const getRowStyle = useCallback(({data}) => {
        const deg = ((data.currency.toUpperCase().charCodeAt(0) - 65) * 12)
            + (data.currency.toUpperCase().charCodeAt(1) - 65)
            + Math.floor((data.currency.toUpperCase().charCodeAt(2) - 65)/2);
        return {background: `hsl(${deg}deg, 100%, 85%)`}
    }, []);

    const rowSpan = useCallback(
        ({data}) => withPurchases ? (data.purchaseIndex ? 1 : data.purchases) : 1,
        [withPurchases]
    );

    const cellStyle = useCallback(
        ({data}) => withPurchases && data.purchaseIndex ? {display: 'none'} : {},
        [withPurchases]
    );


    const columnDefs = useMemo(() => [
        ...[
            {field: 'id', filter: 'agNumberColumnFilter', rowSpan, cellStyle, hide: true },
            {field: 'year', filter: 'agNumberColumnFilter', rowSpan, cellStyle, hide: true  },
            {field: 'date', rowSpan, cellStyle },
            {field: 'dateTime', rowSpan, cellStyle, hide: true  },
            {field: 'currency', rowSpan, cellStyle },
            {field: 'sold', rowSpan, cellStyle },
            {field: 'soldFor', rowSpan, cellStyle },
            {field: 'localCurrency', rowSpan, cellStyle, hide: true  },
            {field: 'totalCost', rowSpan, cellStyle, valueGetter: ({data}) => data.totalCost?.toFixed(2) },
            {field: 'cost', rowSpan, cellStyle, valueGetter: ({data}) => data.cost?.toFixed(2), hide: true  },
            {field: 'purchaseFeeValue', rowSpan, cellStyle, valueGetter: ({data}) => data.purchaseFeeValue?.toFixed(2), hide: true  },
            {field: 'saleFeeValue', rowSpan, cellStyle, valueGetter: ({data}) => data.saleFeeValue?.toFixed(2), hide: true  },
            {field: 'gain', rowSpan, cellStyle, valueGetter: ({data}) => data.gain?.toFixed(2) },
            {field: 'cryptoAmount', rowSpan, cellStyle, hide: true  },
            {field: 'rateToCrypto', rowSpan, cellStyle, hide: true  },
            {field: 'rateToLocal', rowSpan, cellStyle, hide: true  },
            {field: 'type', rowSpan, cellStyle, hide: true  },
            {field: 'purchases', rowSpan, cellStyle },
            {field: 'purchaseDates', valueGetter: ({data}) => data.purchaseDates.join('|'), rowSpan, cellStyle },
        ],
        ...(withPurchases ? [
            {field: 'purchaseItemDateTime'},
            {field: 'purchaseItemAmount'},
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
            }}

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
