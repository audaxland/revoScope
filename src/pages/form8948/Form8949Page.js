import {Input} from "@material-tailwind/react";
import {useEffect, useMemo, useState} from "react";
import {useFileContext} from "../../store/FilesContext";
import {useSettingsContext} from "../../store/SettingsContext";
import DropDown from "../../elements/inputs/DropDown";
import TitledBox from "../../elements/boxes/TitledBox";
import {
    computeLongTermShortTem,
    defaultExchangeRate,
    formatTaxData,
    getAllSalesTotals
} from "../../lib/taxesHelper";
import { DATE_FORMAT_MM_DD_YYYY, MULTI_DATES_STATIC } from "../../lib/formatHelper";
import Form8949, {availableYears} from "../../models/Form8949";
import AlertErrors from "../../elements/alerts/AlertErrors";
import ExternalDataSection from "./ExternalDataSection";
import useExternalFile from "../../hooks/useExternalFile";
import Form8949SettingsSection from "./Form8949SettingsSection";
import ComputedTotals from "./ComputedTotals";
import Download8949Section from "./Download8949Section";

/**
 * renders the "Form 8949" page
 * @returns {JSX.Element}
 * @constructor
 */
const Form8949Page = () => {

    /**
     * @type {[string, function]} taxYear: tax year selected in the top dropdown of the page
     */
    const [taxYear, setTaxYear] = useState(availableYears[0]);

    /**
     * @type {[number, function]} exchangeRate: the exchange rate to apply to convert the local currency to USD
     */
    const [exchangeRate, setExchangeRate] = useState(1);

    /**
     * list of settings for generating the form 8949 files
     * @type formSettings {Object}
     */
    const [formSettings, setFormSettings] = useState({
        descriptionFormat: '#CURRENCY# #AMOUNT#',
        datesFormat: DATE_FORMAT_MM_DD_YYYY,
        multiDatesFormat: MULTI_DATES_STATIC,
        multiDatesText: 'VARIOUS',
        multiDatesSeparator: '|',
        name: '',
        ssn: '',
    })

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
     * The external files are stored in memory
     */
    const {
        externalRecords,
        yearExternalRecords,
        addExternalFile,
        externalFiles,
        clearAllExternalFiles
    } = useExternalFile()

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
        setSalesData(computeLongTermShortTem({accounts, taxYear}));
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
            formSettings,
        }));
    }, [salesData, exchangeRate, formSettings]);

    /**
     * @type {Form8949} instance of the Form8949 class, with the data included
     */
    const form = useMemo(() => (
        (new Form8949({
            year: taxYear,
            name: formSettings.name,
            ssn: formSettings.ssn,
        }))
            .addData(taxData.partI)
            .addData(taxData.partII)
            .addData(yearExternalRecords(taxYear))
    ), [taxYear, taxData, formSettings, externalRecords])

    // update the exchange rate when changing the year
    useEffect(() => {
        setExchangeRate(old => defaultExchangeRate({
            referenceCurrency, year: taxYear, defaultRate:old
        }));
    }, [taxYear, referenceCurrency])

    return (
        <div>
            {(!!errors.length) && (
                <AlertErrors errors={errors} onClose={() => setErrors([])} />
            )}

            <TitledBox title="Tax Year">
                <div className='flex flex-row gap-3 items-center'>
                    <div className='flex w-60'>Select Tax Year</div>
                    <div className='w-60'>
                        <DropDown
                            label="Tax Year"
                            options={availableYears}
                            value={taxYear}
                            onChange={setTaxYear}
                        />
                    </div>
                </div>

                {(referenceCurrency !== 'USD') && (
                    <div className='flex flex-row gap-3 items-center pb-5'>
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
            </TitledBox>

            <ComputedTotals {...{taxYear, referenceCurrency, salesTotals}} />

            <ExternalDataSection {...{taxYear, addExternalFile, externalFiles, clearAllExternalFiles}} />

            <Form8949SettingsSection
                {...{taxYear, setTaxYear, exchangeRate, setExchangeRate, formSettings, setFormSettings}}
            />

            <Download8949Section {...{taxYear, form }} />

        </div>
    );
}

export default Form8949Page;
