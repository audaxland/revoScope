import GridWithControl from "./parts/GridWithControl";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useFileContext} from "../../store/FilesContext";
import {cleanDecimal} from "./parts/gridHelper";


const TransactionsGrid = () => {
    const {accounts} = useFileContext();
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        const newRowData = [];
        Object.keys(accounts).forEach(currency => {
            newRowData.push(...accounts[currency].listTransactions())
        })
        newRowData.sort((a,b) => a.dateTime > b.dateTime ? 1 : (a.dateTime < b.dateTime ? -1 : 0))
        setRowData(newRowData);

    }, [accounts]);


    const columnDefs = useMemo(() => [
        {field: 'year', filter: 'agNumberColumnFilter', hide: true},
        {field: 'month', filter: 'agNumberColumnFilter', hide: true},
        {field: 'dateTime'},
        {field: 'currency'},
        {field: 'purchased', filter: 'agNumberColumnFilter', valueGetter: cleanDecimal('purchased') },
        {field: 'sold', filter: 'agNumberColumnFilter', valueGetter: cleanDecimal('sold') },
        {field: 'cryptoAmount', filter: 'agNumberColumnFilter', hide: true},
        {field: 'localAmount', filter: 'agNumberColumnFilter' },
        {field: 'localCurrency', hide: true},
        {field: 'cryptoBalance', filter: 'agNumberColumnFilter' },
        {field: 'balanceToDate', filter: 'agNumberColumnFilter', hide: true, valueGetter: cleanDecimal('balanceToDate')},
        {field: 'balanceValue', filter: 'agNumberColumnFilter' },
        {
            field: 'balanceDelta',
            filter: 'agNumberColumnFilter',
            hide: true,
            valueGetter: ({data}) => Number(Math.abs(Number(data.balanceToDate) - Number(data.cryptoBalance)).toFixed(12).replace(/0+$/, '0'))},
        {field: 'gain', filter: 'agNumberColumnFilter', valueGetter: ({data}) => data.gain.toFixed(2)},

        {field: 'type', hide: true},

        {field: 'rateToLocal', filter: 'agNumberColumnFilter', hide: true, valueGetter: cleanDecimal('rateToLocal')},
        {field: 'rateToCrypto', filter: 'agNumberColumnFilter', hide: true, valueGetter: cleanDecimal('rateToCrypto')},
        {field: 'cost', filter: 'agNumberColumnFilter' , hide: true},
        {field: 'purchaseFeeValue', filter: 'agNumberColumnFilter' , hide: true},
        {field: 'saleFeeValue', filter: 'agNumberColumnFilter' , hide: true},
    ], []);

    const getRowStyle = useCallback(({data}) => {
        const deg = ((data.currency.toUpperCase().charCodeAt(0) - 65) * 12)
            + (data.currency.toUpperCase().charCodeAt(1) - 65)
            + Math.floor((data.currency.toUpperCase().charCodeAt(2) - 65)/2);
        return {background: `hsl(${deg}deg, 100%, 90%)`}
    }, []);

    return (
        <GridWithControl {...{
            rowData,
            columnDefs,
            getRowStyle,
            gridName: 'Transactions',
        }} />
    );
}

export default TransactionsGrid;
