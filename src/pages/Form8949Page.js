import {Button, Input} from "@material-tailwind/react";
import {useEffect, useState} from "react";
import {useFileContext} from "../store/FilesContext";
import {useSettingsContext} from "../store/SettingsContext";

import DropDown from "../elements/inputs/DropDown";
import TitledBox from "../elements/boxes/TitledBox";
import FlexWrapSection from "../elements/boxes/FlexWrapSection";
import {defaultExchangeRate, exportTaxDataCsv, formatTaxData, getSalesTotals} from "../lib/taxesHelper";
import Form8949TotalsTable from "../elements/tables/Form8949TotalsTable";
import {
    DATE_FORMAT_DD_MM_YYYY,
    DATE_FORMAT_MM_DD_YYYY,
    DATE_FORMAT_YYYY_MM_DD,
    MULTI_DATES_ALL, MULTI_DATES_FIRST, MULTI_DATES_FIRST_LAST, MULTI_DATES_LAST, MULTI_DATES_STATIC
} from "../lib/formatHelper";
import Form8949 from "../models/Form8949";
import AlertErrors from "../elements/alerts/AlertErrors";



const Form8949Page = () => {
    const [taxYear, setTaxYear] = useState('2022');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [description, setDescription] = useState('#CURRENCY# #AMOUNT#');
    const [datesFormat, setDatesFormat] = useState(DATE_FORMAT_MM_DD_YYYY);
    const [multiDatesFormat, setMultiDatesFormat] = useState(MULTI_DATES_STATIC);
    const [multiDatesText, setMultiDatesText] = useState('VARIOUS');
    const [multiDatesSeparator, setMultiDatesSeparator] = useState('|');
    const [name, setName] = useState('');
    const [ssn, setSsn] = useState('');

    const {accounts} = useFileContext();
    const {referenceCurrency} = useSettingsContext();

    const [salesData, setSalesData] = useState({shortTerm: [], longTerm: []});
    const [salesTotals, setSalesTotals] = useState(() => getSalesTotals({}));

    const [taxData, setTaxData] = useState(() => formatTaxData(salesData));

    const [errors, setErrors] = useState([]);

    useEffect(() => {
        const shortTerm = [];
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
        setSalesData({shortTerm, longTerm});
    }, [accounts, taxYear]);

    useEffect(() => {
        setSalesTotals(getSalesTotals({...salesData, exchangeRate}));
    }, [salesData, exchangeRate]);

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

    useEffect(() => {
        setExchangeRate(old => defaultExchangeRate({
            referenceCurrency, year: taxYear, defaultRate:old
        }));
    }, [taxYear, referenceCurrency])

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
                            options={['2022', '2021', '2020', '2019']}
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
                    {[...Array((Math.floor(taxData.partI.length/14) + 1))].map((_,p) => (
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
                    {[...Array((Math.floor(taxData.partII.length/14) + 1))].map((_,p) => (
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
