import {Button, Input} from "@material-tailwind/react";
import {useEffect, useState} from "react";
import {useFileContext} from "../store/FilesContext";
import {useSettingsContext} from "../store/SettingsContext";
import DropDown from "../elements/inputs/DropDown";
import TitledBox from "../elements/boxes/TitledBox";
import FlexWrapSection from "../elements/boxes/FlexWrapSection";
import {defaultExchangeRate, exportTaxDataCsv, formatTaxData, getAllSalesTotals} from "../lib/taxesHelper";
import Form8949TotalsTable from "../elements/tables/Form8949TotalsTable";
import {
    DATE_FORMAT_DD_MM_YYYY,
    DATE_FORMAT_MM_DD_YYYY,
    DATE_FORMAT_YYYY_MM_DD,
    MULTI_DATES_ALL, MULTI_DATES_FIRST, MULTI_DATES_FIRST_LAST, MULTI_DATES_LAST, MULTI_DATES_STATIC
} from "../lib/formatHelper";
import Form8949 from "../models/Form8949";
import AlertErrors from "../elements/alerts/AlertErrors";

/**
 * renders the "Form 8949" page
 * @returns {JSX.Element}
 * @constructor
 */
const Form8949Page = () => {
    /**
     * @type {[string, function]} taxYear: tax year selected in the top drowdown of th epage
     */
    const [taxYear, setTaxYear] = useState('2024');

    /**
     * @type {[number, function]} exchangeRate: the exchange rate to apply to convert the local currency to USD
     */
    const [exchangeRate, setExchangeRate] = useState(1);

    /**
     * @type {{string, function}} description: the format to use to render the first column of the Form8949 tables
     */
    const [description, setDescription] = useState('#CURRENCY# #AMOUNT#');

    /**
     * @type {[string, function]} datesFormat: a DATE_FORMAT_* constant to select which date format to use for Form8949
     */
    const [datesFormat, setDatesFormat] = useState(DATE_FORMAT_MM_DD_YYYY);

    /**
     * @type {[string, function]} multiDatesFormat: a MULTI_DATES_* constant to select how to handle multiple acquisition dates
     */
    const [multiDatesFormat, setMultiDatesFormat] = useState(MULTI_DATES_STATIC);

    /**
     * @type {[string, function]} multiDatesText: text to use as static text when using MULTI_DATES_STATIC form multiple dates
     */
    const [multiDatesText, setMultiDatesText] = useState('VARIOUS');

    /**
     * @type {[string, function]} multiDatesSeparator: separator to use if joining multiple dates
     */
    const [multiDatesSeparator, setMultiDatesSeparator] = useState('|');

    /**
     * @type {[string, function]} name to render on From8949
     */
    const [name, setName] = useState('');

    /**
     * @type {[string, function]} ssn to render on Form8949
     */
    const [ssn, setSsn] = useState('');

    /**
     * @type {{accounts: Object}} list of Account instances using the currency as the object key
     */
    const {accounts} = useFileContext();

    /**
     * @type {{referenceCurrency: string}} the local or base currency that the assets were bought/sold with
     */
    const {referenceCurrency} = useSettingsContext();

    /**
     * @type {[{shortTerm: Sale[], longTerm: Sale[]}, function]} Sale instances of sales made the selected year, grouped by long/short term
     */
    const [salesData, setSalesData] = useState({shortTerm: [], longTerm: []});

    /**
     * @type {[Object, function]}} total of sales made the selected year
     */
    const [salesTotals, setSalesTotals] = useState(() => getAllSalesTotals({}));

    /**
     * @type {[Object[], function]} sales data prepared for Form8949
     */
    const [taxData, setTaxData] = useState(() => formatTaxData(salesData));

    /**
     * @type {[string[], function]} list of errors to display on the page
     */
    const [errors, setErrors] = useState([]);

    // extract from all the Account instances the sales made the selected year and group them by short/long term
    useEffect(() => {
        /**
         * @type {Sale[]} sales of short term assets sold the selected year
         */
        const shortTerm = [];

        /**
         * @type {Sale[]} sales of long term assets sold the selected year
         */
        const longTerm = [];

        Object.values(accounts).forEach(account => {
            account.listSales(false).forEach(sale => {
                if ((sale.year === Number(taxYear)) && (sale.type === 'sale')) {
                    const saleItem = {
                        currency: sale.currency,
                        amount: sale.sold,
                        acquiredDates: sale.purchaseDates,
                        soldDate: sale.date,
                        soldFor: sale.soldFor,
                        soldCurrency: sale.localCurrency,
                        totalCost: sale.totalCost,
                        gain: sale.gain,
                    };

                    // if any of the purchase dates is less than one year, the sale is a short term transaction
                    const oneYearBeforeSale = new Date((new Date(sale.date)).setFullYear(sale.year - 1));
                    const isShortTerm = sale.purchaseDates.reduce((prev, curr) => {
                        if (prev) return prev;
                        return (new Date(curr)) > oneYearBeforeSale;
                    }, false);

                    if (isShortTerm) {
                        shortTerm.push(saleItem);
                    } else {
                        longTerm.push(saleItem);
                    }
                }
            });
        });
        shortTerm.sort((a, b) => a.soldDate > b.soldDate ? 1 : (a.soldDate < b.soldDate ? -1 : 0));
        longTerm.sort((a, b) => a.soldDate > b.soldDate ? 1 : (a.soldDate < b.soldDate ? -1 : 0));
        setSalesData({shortTerm, longTerm});
    }, [accounts, taxYear]);

    // update the sales totals
    useEffect(() => {
        setSalesTotals(getAllSalesTotals({...salesData, exchangeRate}));
    }, [salesData, exchangeRate]);

    // prepare the sales data for Form8949
    useEffect(() => {
        setTaxData(formatTaxData({
            ...salesData,
            exchangeRate,
            description,
            datesFormat,
            multiDatesFormat,
            multiDatesText,
            multiDatesSeparator,
        }));
    }, [salesData, exchangeRate, description, datesFormat, multiDatesFormat, multiDatesText, multiDatesSeparator]);

    // update the exchange rate when changing the year
    useEffect(() => {
        setExchangeRate(old => defaultExchangeRate({
            referenceCurrency, year: taxYear, defaultRate:old
        }));
    }, [taxYear, referenceCurrency])

    /**
     * Generate a pdf page of Form8949 and make it download it
     * @param page {number} page number to generate
     * @param part {'partI'|'partII'|'all'} which part of the form to generate
     * @returns {(function(): Promise<void>)|*}
     */
    const handleForm = ({page = 1, part = 'all'}) => async () => {
        try {
            setErrors([]);
            const form = new Form8949({year: taxYear, taxData, name, ssn})
            await form.downloadFormPdf({page, part});
        } catch (error) {
            setErrors(old => [...old, error?.message ?? 'An error occurred!']);
        }
    }

    return (
        <div>
            {(!!errors.length) && (
                <AlertErrors errors={errors} onClose={() => setErrors([])} />
            )}
            <TitledBox title='Settings for Form 8949'>
                <div className='flex flex-row gap-3 items-center'>
                    <div className='flex w-60'>Select Tax Year</div>
                    <div className='w-60'>
                        <DropDown
                            label="Tax Year"
                            options={['2024', '2023', '2022', '2021', '2020', '2019']}
                            value={taxYear}
                            onChange={setTaxYear}
                        />
                    </div>
                </div>

                {(referenceCurrency !== 'USD') && (
                    <div className='flex flex-row gap-3 items-center border-b border-indigo-300/50 pb-5'>
                        <div className='flex w-60'>Exchange Rate (USD 1 = {referenceCurrency} ???)</div>
                        <div className='w-60'>
                            <Input
                                label={`USD 1 = ${referenceCurrency} ...`}
                                className='bg-white/80 text-black/90'
                                value={exchangeRate}
                                onChange={e => setExchangeRate(e.target.value
                                    .replaceAll(/[^0-9.]/g, '')
                                    .replaceAll(/(\.[^.]*)\./g, "$1")
                                )}
                            />
                        </div>
                    </div>
                )}

                <div className='flex flex-row gap-3 items-center'>
                    <div className='flex w-60'>Description format</div>
                    <div className='w-60'>
                        <Input
                            label="Description"
                            className='bg-white/80 text-black/90'
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className='flex flex-row gap-3 items-center'>
                    <div className='flex w-60'>Dates Format</div>
                    <div className='w-60'>
                        <DropDown
                            label="Dates Format"
                            options={[DATE_FORMAT_MM_DD_YYYY, DATE_FORMAT_DD_MM_YYYY, DATE_FORMAT_YYYY_MM_DD]}
                            value={datesFormat}
                            onChange={setDatesFormat}
                        />
                    </div>
                </div>

                <div className='flex flex-row gap-3 items-center border-b border-indigo-300/50 pb-5'>
                    <div className='flex w-60'>Multi Dates Format</div>
                    <div className='w-60'>
                        <DropDown
                            label="Multi Dates Format"
                            options={[MULTI_DATES_STATIC, MULTI_DATES_ALL, MULTI_DATES_FIRST_LAST, MULTI_DATES_FIRST, MULTI_DATES_LAST]}
                            value={multiDatesFormat}
                            onChange={setMultiDatesFormat}
                        />
                    </div>
                    <div>
                        {(multiDatesFormat === MULTI_DATES_STATIC) && (
                            <Input
                                label="Static Text"
                                className='bg-white/80 text-black/90'
                                value={multiDatesText}
                                onChange={e => setMultiDatesText(e.target.value)}
                            />
                        )}
                        {(multiDatesFormat !== MULTI_DATES_STATIC) && (
                            <Input
                                label="Separator"
                                className='bg-white/80 text-black/90'
                                value={multiDatesSeparator}
                                onChange={e => setMultiDatesSeparator(e.target.value)}
                            />
                        )}
                    </div>
                </div>

                <div className='flex flex-row gap-3 items-center'>
                    <div className='flex w-60'>Name on Form</div>
                    <div className='w-60'>
                        <Input
                            label="Name"
                            className='bg-white/80 text-black/90'
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                </div>
                <div className='flex flex-row gap-3 items-center'>
                    <div className='flex w-60'>SSN on Form</div>
                    <div className='w-60'>
                        <Input
                            label="SSN"
                            className='bg-white/80 text-black/90'
                            value={ssn}
                            onChange={e => setSsn(e.target.value)}
                        />
                    </div>
                </div>
            </TitledBox>

            <TitledBox title={`Download Form 8949 - Year ${taxYear}`}>
                <FlexWrapSection title={`All Pages Totals`}>
                    <Form8949TotalsTable
                        cornerCell={<div className='text-right font-bold px-3'>Totals in {referenceCurrency}</div>}
                        currency={referenceCurrency}
                        shortTermTotals={salesTotals.shortTermTotals}
                        longTermTotals={salesTotals.longTermTotals}
                    />
                    {(referenceCurrency !== 'USD') && (
                        <Form8949TotalsTable
                            cornerCell={<div className='text-right font-bold px-3'>Totals in USD</div>}
                            currency='USD'
                            shortTermTotals={salesTotals.shortTermTotalsUsd}
                            longTermTotals={salesTotals.longTermTotalsUsd}
                        />
                    )}
                </FlexWrapSection>

                <FlexWrapSection title='Csv Export'>
                    <Button
                        onClick={() => {exportTaxDataCsv({taxData, taxYear})}}
                    >Export Form 8949 Data as CSV File</Button>
                </FlexWrapSection>

                <FlexWrapSection title='Form 8949 PDF - Part I/Short Term Pages'>
                    {[...Array(Math.max(Math.ceil(taxData.partI.length/14), 1))].map((_,p) => (
                        <Button
                            size="sm"
                            className="min-w-[9em]"
                            key={p}
                            onClick={handleForm({page: p + 1, part: 'I'})}
                        >
                            I - Page {p + 1}
                        </Button>
                    ))}
                </FlexWrapSection>

                <FlexWrapSection title='Form 8949 PDF - Part II/Long Term Pages'>
                    {[...Array(Math.max(Math.ceil(taxData.partII.length/14), 1))].map((_,p) => (
                        <Button
                            size="sm"
                            className="min-w-[9em]"
                            key={p}
                            onClick={handleForm({page: p + 1, part: 'II'})}
                        >
                            II - Page {p + 1}
                        </Button>
                    ))}
                </FlexWrapSection>
            </TitledBox>
        </div>
    );
}

export default Form8949Page;
