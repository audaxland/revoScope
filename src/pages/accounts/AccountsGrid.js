import {useFileContext} from "../../store/FilesContext";
import GridWithControl from "../../elements/grids/GridWithControl";
import {useCallback, useEffect, useMemo, useState} from "react";
import {cleanDecimal} from "../../elements/grids/gridHelper";
import gridHelpFile from './accountsGridHelp.yml';

/**
 * Renders the Accounts Grid
 * @returns {JSX.Element}
 * @constructor
 */
const AccountsGrid = () => {
    /**
     * @type {{accounts: Account}} list of Account models, each contains the data of a cryptocurrency assets and transactions
     */
    const {accounts} = useFileContext();

    /**
     * @type {[rowData: Object[], function]} data that will be rendered in the grid
     */
    const [rowData, setRowData] = useState([]);

    // reads all the accounts and sets the corresponding data to render in the grid
    useEffect(() => {
        const newRowData = [];
        Object.keys(accounts).forEach(currency => {
            const summary = accounts[currency].summary()
            newRowData.push(...Object.values(summary))
        });
        // sort rows by currency and year
        newRowData.sort((a,b) => a.currency > b.currency ? 1 : (a.currency < b.currency ? -1 : (
            a.year > b.year ? 1 : (a.year < b.year ? -1 : 0)
        )))
        setRowData(newRowData);
    }, [accounts]);

    /**
     *
     * @type {Object} definition of the columns of the grid
     */
    const columnDefs = useMemo(() => [
        {field: 'currency'},
        {field: 'year', filter: 'agNumberColumnFilter'},
        {field: 'purchases', filter: 'agNumberColumnFilter'},
        {field: 'sales', filter: 'agNumberColumnFilter'},
        {field: 'salesInvalid', filter: 'agNumberColumnFilter', hide: true},
        {field: 'purchased', filter: 'agNumberColumnFilter', valueGetter: cleanDecimal('purchased')},
        {field: 'purchasedFor', filter: 'agNumberColumnFilter'},
        {field: 'sold', filter: 'agNumberColumnFilter', valueGetter: cleanDecimal('sold')},
        {field: 'soldFor', filter: 'agNumberColumnFilter'},
        {field: 'soldInvalid', filter: 'agNumberColumnFilter', hide: true},
        {field: 'soldInvalidFor', filter: 'agNumberColumnFilter', hide: true},
        {field: 'gain', filter: 'agNumberColumnFilter', valueGetter: ({data}) => data.gain.toFixed(2)},
        {field: 'lastBalance', filter: 'agNumberColumnFilter'},
        {field: 'lastBalanceValue', filter: 'agNumberColumnFilter', valueGetter: ({data}) => data.lastBalanceValue.toFixed(2)},
        {field: 'maxBalance', filter: 'agNumberColumnFilter'},
        {field: 'maxBalanceValue', filter: 'agNumberColumnFilter', valueGetter: ({data}) => data.lastBalanceValue.toFixed(2)},
        {field: 'lastDate', hide: true},
        {field: 'minRate', filter: 'agNumberColumnFilter', hide: true},
        {field: 'maxRate', filter: 'agNumberColumnFilter', hide: true},
        {field: 'totalFeesValue', filter: 'agNumberColumnFilter', valueGetter: ({data}) => data.totalFeesValue.toFixed(2)},
    ], []);

    /**
     * @type {function} getRowStyle: computes the background color of the row depending on the row currency value
     */
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
            getRowStyle,
            gridName: 'Accounts',
            gridHelpFile
        }} />
    );
}

export default AccountsGrid;
