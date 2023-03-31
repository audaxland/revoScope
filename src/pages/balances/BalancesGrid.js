import {useFileContext} from "../../store/FilesContext";
import {useEffect, useState} from "react";
import GridWithControl from "../../elements/grids/GridWithControl";
import DefaultButton from "../../elements/buttons/DefaultButton";
import {useSettingsContext} from "../../store/SettingsContext";
import {getAllRecords} from "../../store/dbRecords";

/**
 * @type {string} Constant used to list all records in the balances grid
 */
const DISPLAY_ALL = 'All';

/**
 * @type {string} Constant used to list only exchanges to an from cryptocurrencies in the balances grid
 */
const DISPLAY_EXCHANGES = 'Exchanges';

/**
 * Renders the Balances Grid
 * @returns {JSX.Element}
 * @constructor
 */
const BalancesGrid = () => {
    /**
     * @type {referenceCurrency: string}} the local/base currency that the assets were bought and sold with
     */
    const {referenceCurrency} = useSettingsContext();

    /**
     * @type {{accounts: Object}} list of cryptocurrencies Accounts
     */
    const {accounts} = useFileContext();

    /**
     * @type {[Object[], function]} data to display on the grid
     */
    const [rowData, setRowData] = useState([]);

    /***
     * @type {[Object, function]} Definition of columns in the balances Grid
     */
    const [columnDefs, setColumnDefs] = useState([]);

    /**
     * @type {[Object, function]} Field definitions for the grid help drawer
     */
    const [gridHelpObject, setGridHelpObject] = useState({});

    /**
     * @type {[string, function]} State for the toggle mode between showing all records or showing only exchanges
     */
    const [displayMode, setDisplayMode] = useState(DISPLAY_EXCHANGES)

    /**
     * Computes the columns and field help definition based on the list of currencies that we actually have
     */
    useEffect(() => {
        // initial columns for the grid
        const newColumnsDef = [
            {field: 'date'},
            {field: 'dateTime', hide: true},
            {field: 'Total', filter: 'agNumberColumnFilter' },
            {field: referenceCurrency, filter: 'agNumberColumnFilter' }
        ];

        // initial help fields for the drawer
        const newGridHelpObject = {
            gridFields: {
                Date: 'Date of the balance record.',
                'Date Time': 'Date and time of the transaction in the format "YYYY-MM-DD HH:MM:SS".',
                Total: 'Sum of the value of all accounts in ' + referenceCurrency,
                [referenceCurrency]: 'Balance in the ' + referenceCurrency + ' account',
            }
        }

        Object.values(accounts).forEach(({currency}) => {
            // add the columns for the currency
           newColumnsDef.push({field: currency, filter: 'agNumberColumnFilter' });
           newColumnsDef.push({field: currency + 'Value', filter: 'agNumberColumnFilter' });
           newColumnsDef.push({field: currency + 'Rate', hide: true, filter: 'agNumberColumnFilter' });
           newColumnsDef.push({field: currency + 'Rate' + referenceCurrency, hide: true, filter: 'agNumberColumnFilter' });

           // add the help fields for the currency
           newGridHelpObject.gridFields[currency] = 'Balance in the ' + currency + ' account';
           newGridHelpObject.gridFields[currency + ' Value'] = 'Value in ' + referenceCurrency + ' of the balance in the ' + currency + ' account';
           newGridHelpObject.gridFields[currency + ' Rate'] = 'Conversion rate from ' + currency + ' to ' + referenceCurrency;
           newGridHelpObject.gridFields[currency + ' Rate ' + referenceCurrency] = 'Conversion rate from ' + referenceCurrency + ' to ' + currency;
        });
        setColumnDefs(newColumnsDef);
        setGridHelpObject(newGridHelpObject);
    }, [accounts, referenceCurrency]);

    // read the records from IndexDB
    useEffect(() => {
        if ((!accounts) || (!Object.keys(accounts).length)) return;

        (async () => {
            const newDateBalances = [];
            const allRecords = await getAllRecords();
            allRecords.forEach(record => {
                // if we only want exchanges, then skip the non-exchanges
                if ((displayMode === DISPLAY_EXCHANGES) && (record.Type !== 'EXCHANGE')) return;

                const dateTime = record['Started Date'];
                const balances = {[record.Currency]: record.Balance};

                // for cryptocurrencies we also need the exchange rate and the value of the balance in the reference currency
                if (accounts[record.Currency]) {
                    const rate = accounts[record.Currency].getRate(dateTime);
                    balances[record.Currency + 'Rate'] = rate.rateToLocal;
                    balances[record.Currency + 'Rate' + referenceCurrency] = rate.rateToCrypto;
                    balances[record.Currency + 'Value'] = Number((record.Balance * rate.rateToLocal).toFixed(2));
                }

                // If there are multiple records with the same date and time, add the balances to the same object
                const lastIndex = newDateBalances.length - 1;
                if ((!newDateBalances.length) || (newDateBalances[lastIndex].dateTime !== dateTime)) {
                    newDateBalances.push({dateTime, balances});
                } else if ((!newDateBalances[lastIndex].balances[record.Currency])
                    || (newDateBalances[lastIndex].balances[record.Currency] < record.Balance)
                ) {
                    Object.entries(balances).forEach(([key, value]) => {
                        newDateBalances[lastIndex].balances[key] = value;
                    });
                }
            })

            // combine the balances for all the accounts

            const currentBalances = {
                Total: 0.0,
                [referenceCurrency]: 0.0,
                ...(Object.keys(accounts).reduce((prev, curr) => {
                    prev[curr] = 0.0;
                    prev[curr + 'Rate'] = 0.0;
                    prev[curr + 'Rate' + referenceCurrency] = 0.0;
                    prev[curr + 'Value'] = 0.0;
                    return prev;
                }, {}))
            }

            // build the data to render with all the currencies
            setRowData(newDateBalances.map(row => {
                const {dateTime, balances} = row;
                Object.entries(balances).forEach(([key, value]) => {
                    currentBalances[key] = Number(value);
                });

                // re-calculate the total, as the sum of all the fields with a key like XxxxValue and the reference currency column
                currentBalances.Total = Object.entries(currentBalances).reduce((prev, [key, value]) => {
                    if (key.substring(key.length - 5) === 'Value') {
                        prev = Number((prev + value).toFixed(2));
                    }
                    return prev;
                }, currentBalances[referenceCurrency]);

                return {
                    dateTime,
                    date: dateTime.split(' ')[0],
                    ...currentBalances,
                }
            }))
        })()
    }, [accounts, displayMode, referenceCurrency])


    return (
        <GridWithControl
            {...{
                rowData,
                columnDefs,
                suppressRowTransform: true,
                gridName: 'Sales',
                gridHelpObject,
            }}

            // preGrid is the top section above the grid, with the buttons to toggle the sale with/without the purchases
            preGrid={(
                <div className='p-3'>
                    <div className='flex flex-row gap-2 items-center'>
                        <DefaultButton
                               onClick={() => setDisplayMode(DISPLAY_EXCHANGES)}
                               disabled={displayMode === DISPLAY_EXCHANGES}
                        >
                            Display Exchanges Only
                        </DefaultButton>
                        <DefaultButton
                            onClick={() => setDisplayMode(DISPLAY_ALL)}
                            disabled={displayMode === DISPLAY_ALL}
                        >
                            Display All records
                        </DefaultButton>
                    </div>
                </div>
            )}
        />
    );
}

export default BalancesGrid;
