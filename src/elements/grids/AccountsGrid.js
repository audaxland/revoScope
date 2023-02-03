import {useFileContext} from "../../store/FilesContext";
import GridWithControl from "./parts/GridWithControl";
import {useCallback, useEffect, useMemo, useState} from "react";

const AccountsGrid = () => {
    const {accounts} = useFileContext();
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        const newRowData = [];
        Object.keys(accounts).forEach(currency => {
            const summary = accounts[currency].summary()
            newRowData.push(...Object.values(summary))
        });
        newRowData.sort((a,b) => a.currency > b.currency ? 1 : (a.currency < b.currency ? -1 : (
            a.year > b.year ? 1 : (a.year < b.year ? -1 : 0)
        )))
        setRowData(newRowData);

    }, [accounts]);


    const columnDefs = useMemo(() => [
        {field: 'currency'},
        {field: 'year', filter: 'agNumberColumnFilter'},
        {field: 'purchases', filter: 'agNumberColumnFilter'},
        {field: 'sales', filter: 'agNumberColumnFilter'},
        {field: 'salesInvalid', filter: 'agNumberColumnFilter', hide: true},
        {field: 'purchased', filter: 'agNumberColumnFilter'},
        {field: 'purchasedFor', filter: 'agNumberColumnFilter'},
        {field: 'sold', filter: 'agNumberColumnFilter'},
        {field: 'soldFor', filter: 'agNumberColumnFilter'},
        {field: 'soldInvalid', filter: 'agNumberColumnFilter', hide: true},
        {field: 'soldInvalidFor', filter: 'agNumberColumnFilter', hide: true},
        {field: 'gain', filter: 'agNumberColumnFilter', valueGetter: ({data}) => data.gain.toFixed(2)},
        {field: 'lastBalance', filter: 'agNumberColumnFilter'},
        {field: 'lastBalanceValue', filter: 'agNumberColumnFilter', valueGetter: ({data}) => data.lastBalanceValue.toFixed(2)},
        {field: 'lastDate', hide: true},
        {field: 'minRate', filter: 'agNumberColumnFilter', hide: true},
        {field: 'maxRate', filter: 'agNumberColumnFilter', hide: true},
        {field: 'totalFeesValue', filter: 'agNumberColumnFilter', valueGetter: ({data}) => data.totalFeesValue.toFixed(2)},
    ], []);



    const getRowStyle = useCallback(({data}) => {
        const deg = ((data.currency.toUpperCase().charCodeAt(0) - 65) * 12)
            + (data.currency.toUpperCase().charCodeAt(1) - 65)
            + Math.floor((data.currency.toUpperCase().charCodeAt(2) - 65)/2);
        return {background: `hsl(${deg}deg, 100%, 85%)`}
    }, []);

    return (
        <GridWithControl {...{
            rowData,
            columnDefs,
            getRowStyle
        }} />
    );
}

export default AccountsGrid;
