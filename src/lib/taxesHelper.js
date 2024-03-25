import {
    cleanDecimalString,
    DATE_FORMAT_MM_DD_YYYY,
    formatDateString,
    formatMultiDateString,
    MULTI_DATES_STATIC
} from "./formatHelper";
import {exportCsvFile} from "./exportHelper";
import moment from "moment";

/**
 * currency conversion rates per year used as default exchange rate between the local/base currency and usd for generating the Form8949
 * The following exchange rates are copied from
 * https://www.irs.gov/individuals/international-taxpayers/yearly-average-currency-exchange-rates
 * @type {Object}
 */
export const taxYearExchangeRates = {
    'AFN': {country: 'Afghanistan',     currency: 'Afghani', 	 rates: {'2023': '82.635',   '2022': '90.084', 	 '2021': '83.484', 	'2020': '76.651', 	'2019': '77.579'}},
    'DZD': {country: 'Algeria', 	    currency: 'Dinar', 		 rates: {'2023': '135.933',  '2022': '142.123',  '2021': '135.011', '2020': '126.741', 	'2019': '119.402'}},
    'ARS': {country: 'Argentina', 	    currency: 'Peso', 		 rates: {'2023': '296.154',  '2022': '130.792',  '2021': '95.098', 	'2020': '70.635', 	'2019': '48.192'}},
    'AUD': {country: 'Australia', 	    currency: 'Dollar', 	 rates: {'2023': '1.506',    '2022': '1.442', 	 '2021': '1.332', 	'2020': '1.452', 	'2019': '1.439'	}},
    'BHD': {country: 'Bahrain', 	    currency: 'Dinar', 		 rates: {'2023': '0.377',    '2022': '0.377', 	 '2021': '0.377', 	'2020': '0.377', 	'2019': '0.377'	}},
    'BZD': {country: 'Brazil', 		    currency: 'Real', 		 rates: {'2023': '4.994',    '2022': '5.165', 	 '2021': '5.395', 	'2020': '5.151', 	'2019': '3.946'	}},
    'CAD': {country: 'Canada', 		    currency: 'Dollar', 	 rates: {'2023': '1.350',    '2022': '1.301', 	 '2021': '1.254', 	'2020': '1.341', 	'2019': '1.327'	}},
    'KYD': {country: 'Cayman Islands',  currency: 'Dollar', 	 rates: {'2023': '0.833',    '2022': '0.833', 	 '2021': '0.833', 	'2020': '0.833', 	'2019': '0.833'	}},
    'CNY': {country: 'China', 		    currency: 'Yuan', 		 rates: {'2023': '7.075',    '2022': '6.730', 	 '2021': '6.452', 	'2020': '6.900', 	'2019': '6.910'	}},
    'DKK': {country: 'Denmark', 	    currency: 'Krone', 		 rates: {'2023': '6.890',    '2022': '7.077', 	 '2021': '6.290', 	'2020': '6.538', 	'2019': '6.670'	}},
    'EGP': {country: 'Egypt', 		    currency: 'Pound', 		 rates: {'2023': '30.651',   '2022': '19.208', 	 '2021': '15.697', 	'2020': '15.813', 	'2019': '16.809'}},
    'EUR': {country: 'Euro Zone', 	    currency: 'Euro', 		 rates: {'2023': '0.924',    '2022': '0.951', 	 '2021': '0.846', 	'2020': '0.877', 	'2019': '0.893'	}},
    'HKD': {country: 'Hong Kong', 	    currency: 'Dollar', 	 rates: {'2023': '7.829',    '2022': '7.831', 	 '2021': '7.773', 	'2020': '7.756', 	'2019': '7.835'	}},
    'HUF': {country: 'Hungary', 	    currency: 'Forint', 	 rates: {'2023': '353.020',  '2022': '372.775',  '2021': '303.292', '2020': '307.766', 	'2019': '290.707'}},
    'ISK': {country: 'Iceland', 	    currency: 'Krona', 		 rates: {'2023': '137.857',  '2022': '135.296',  '2021': '126.986', '2020': '135.354', 	'2019': '122.571'}},
    'INR': {country: 'India', 		    currency: 'Rupee', 		 rates: {'2023': '82.572',   '2022': '78.598', 	 '2021': '73.936', 	'2020': '74.102', 	'2019': '70.394'}},
    'IQD': {country: 'Iraq', 		    currency: 'Dinar', 		 rates: {'2023': '1376.529', '2022': '1459.751', '2021': '1460.133','2020': '1197.497', '2019': '1191.254'}},
    'ILS': {country: 'Israel', 		    currency: 'New Shekel',  rates: {'2023': '3.687',    '2022': '3.361', 	 '2021': '3.232', 	'2020': '3.438', 	'2019': '3.563'	}},
    'JPY': {country: 'Japan', 		    currency: 'Yen', 		 rates: {'2023': '140.511',  '2022': '131.454',  '2021': '109.817', '2020': '106.725', 	'2019': '109.008'}},
    'LBP': {country: 'Lebanon', 	    currency: 'Pound', 		 rates: {'2023': '1370.988', '2022': '1515.669', '2021': '1519.228','2020': '1510.677', '2019': '1510.290'}},
    'MXN': {country: 'Mexico', 		    currency: 'Peso', 		 rates: {'2023': '17.733',   '2022': '20.110', 	 '2021': '20.284', 	'2020': '21.466', 	'2019': '19.246'}},
    'MAD': {country: 'Morocco', 	    currency: 'Dirham', 	 rates: {'2023': '10.134',   '2022': '10.275', 	 '2021': '8.995', 	'2020': '9.495', 	'2019': '9.614'	}},
    'NZD': {country: 'New Zealand',     currency: 'Dollar', 	 rates: {'2023': '1.630',    '2022': '1.578', 	 '2021': '1.415', 	'2020': '1.540', 	'2019': '1.518'	}},
    'NOK': {country: 'Norway', 		    currency: 'Kroner', 	 rates: {'2023': '10.564',   '2022': '9.619', 	 '2021': '8.598', 	'2020': '9.413', 	'2019': '8.802'	}},
    'QAR': {country: 'Qatar', 		    currency: 'Rial', 		 rates: {'2023': '3.643',    '2022': '3.644', 	 '2021': '3.644', 	'2020': '3.641', 	'2019': '3.641'	}},
    'RUB': {country: 'Russia', 		    currency: 'Ruble', 		 rates: {'2023': '85.509',   '2022': '69.896', 	 '2021': '73.686', 	'2020': '72.299', 	'2019': '64.687'}},
    'SAR': {country: 'Saudi Arabia',    currency: 'Riyal', 		 rates: {'2023': '3.752',    '2022': '3.755', 	 '2021': '3.751', 	'2020': '3.753', 	'2019': '3.751'	}},
    'SGD': {country: 'Singapore', 	    currency: 'Dollar', 	 rates: {'2023': '1.343',    '2022': '1.379', 	 '2021': '1.344', 	'2020': '1.379', 	'2019': '1.364'	}},
    'ZAR': {country: 'South Africa',    currency: 'Rand', 		 rates: {'2023': '18.457',   '2022': '16.377', 	 '2021': '14.789', 	'2020': '16.458', 	'2019': '14.448'}},
    'KRW': {country: 'South Korean',    currency: 'Won', 		 rates: {'2023': '1306.686', '2022': '1291.729', '2021': '1144.883','2020': '1179.199', '2019': '1165.697'}},
    'SEK': {country: 'Sweden', 		    currency: 'Krona', 		 rates: {'2023': '10.613',   '2022': '10.122', 	 '2021': '8.584', 	'2020': '9.205', 	'2019': '9.457'	}},
    'CHF': {country: 'Switzerland',     currency: 'Franc', 		 rates: {'2023': '0.899',    '2022': '0.955', 	 '2021': '0.914', 	'2020': '0.939', 	'2019': '0.994'	}},
    'TWD': {country: 'Taiwan', 		    currency: 'Dollar', 	 rates: {'2023': '31.160',   '2022': '29.813', 	 '2021': '27.932', 	'2020': '29.460', 	'2019': '30.898'}},
    'THB': {country: 'Thailand', 	    currency: 'Baht', 		 rates: {'2023': '34.802',   '2022': '35.044', 	 '2021': '31.997', 	'2020': '31.271', 	'2019': '31.032'}},
    'TND': {country: 'Tunisia', 	    currency: 'Dinar', 		 rates: {'2023': '3.103',    '2022': '3.082', 	 '2021': '2.778', 	'2020': '2.836', 	'2019': '2.925'	}},
    'TRY': {country: 'Turkey', 		    currency: 'New Lira', 	 rates: {'2023': '23.824',   '2022': '16.572', 	 '2021': '8.904', 	'2020': '7.025', 	'2019': '5.685'	}},
    'AED': {country: 'United Arab Emirates', currency: 'Dirham', rates: {'2023': '3.673',    '2022': '3.673',    '2021': '3.673', 	'2020': '3.673', 	'2019': '3.673'	}},
    'GBP': {country: 'United Kingdom',  currency: 'Pound', 	     rates: {'2023': '0.804',    '2022': '0.811', 	 '2021': '0.727', 	'2020': '0.779', 	'2019': '0.784'	}},
}

/**
 * Get the default exchange rate from USD for a given currency and year
 * @param referenceCurrency {string} the currency to exchange into usd
 * @param year {string|Number} the year the rate is needed for
 * @param defaultRate {Number} rate to return for unknown currencies or year
 * @returns {number}
 */
export const defaultExchangeRate = ({referenceCurrency, year, defaultRate = 1}) => {
    return Number(taxYearExchangeRates[referenceCurrency]?.rates?.[year.toString()] ?? defaultRate);
}

/**
 * Calculates the totals of a list of sales
 * @param sales {Sale[]} list of sales to get the totals of
 * @param exchangeRate {Number} exchange rate to apply
 * @returns {{soldFor: Number, totalCost: Number, gain: Number}}
 */
export const getSalesTotals = (sales, exchangeRate = 1) => {
    const rate = (!isNaN(Number(exchangeRate))) && (exchangeRate > 0) ? Number(exchangeRate) : 1;

    return sales.reduce((prev, curr) => {
        prev.soldFor += curr.soldFor / rate;
        prev.totalCost += curr.totalCost / rate;
        prev.gain += curr.gain / rate;
        return prev;
    }, {
        soldFor: 0.0,
        totalCost: 0.0,
        gain: 0.0,
    });
}

/**
 * get all the totals for both short term sales and long term sales, and in both the local currency and USD
 * @param shortTerm {Sale[]} list of short term assets sales
 * @param longTerm {Sale[]} list of long term assets sales
 * @param exchangeRate {Number} exchange rate to convert to USD
 * @returns {{shortTermTotals: {soldFor: Number, totalCost: Number, gain: Number}, shortTermTotalsUsd: {soldFor: Number, totalCost: Number, gain: Number}, longTermTotalsUsd: {soldFor: Number, totalCost: Number, gain: Number}, longTermTotals: {soldFor: Number, totalCost: Number, gain: Number}}}
 */
export const getAllSalesTotals = ({shortTerm = [], longTerm = [], exchangeRate = 1}) => {
    return {
        shortTermTotals: getSalesTotals(shortTerm),
        shortTermTotalsUsd: getSalesTotals(shortTerm, exchangeRate),
        longTermTotals: getSalesTotals(longTerm),
        longTermTotalsUsd: getSalesTotals(longTerm, exchangeRate),
    }
}

/**
 * Convert the lists of Sale[] arrays to a format prepared for generating the Form8949
 * the format generated is in part controlled by the form settings set on the "Form 8949" page
 * @param shortTerm {Sale[]} list of short term assets sales
 * @param longTerm {Sale[]} list of long term asset sales
 * @param rest {object} optional additional data needed to format the data (date format, exchange rate, ...)
 * @returns {{partII: Object[], partI: Object[]}}
 */
export const formatTaxData = ({shortTerm, longTerm, ...rest}) => ({
    partI: formatTaxPart({
        data: shortTerm,
        part: 'Part I',
        checkbox: 'C',
        ...rest
    }),
    partII: formatTaxPart({
        data: longTerm,
        part: 'Part II',
        checkbox: 'F',
        ...rest
    }),
})

/**
 * Converts the sales data from Sale instances to the format used on Form 8949, either for short term or long term asset sales
 * @param part {'Part I'|'Part II'} which part of the form the data is for
 * @param checkbox {'A'|'B'|'C'|'D'|'E'|'F'}
 * @param data {Sale[]} list of Sale instances to convert
 * @param exchangeRate {Number}  exchange rate to apply to convert to USD
 * @param description {string} format to use in generating the description field
 * @param datesFormat {string} format to use for dates (default is 'MM/DD/YYYY')
 * @param multiDatesFormat {string} constant to set how to treat multiple acquisition dates
 * @param multiDatesText {string} text to use if using static text (MULTI_DATES_STATIC)
 * @param multiDatesSeparator {string} text to join dates if joining dates
 * @returns {Object[]}
 */
export const formatTaxPart = ({
    part = 'Part I',
    checkbox = 'C',
    data,
    exchangeRate,
    description,
    datesFormat= DATE_FORMAT_MM_DD_YYYY,
    multiDatesFormat= MULTI_DATES_STATIC,
    multiDatesText = 'VARIOUS',
    multiDatesSeparator = '|',
}) => {
    if (!data) return [];
    const rate = (!isNaN(Number(exchangeRate))) && (exchangeRate > 0) ? Number(exchangeRate) : 1;
    return data.map(row => ({
        part,
        checkbox,
        // a: description
        a: description.replace('#CURRENCY#', row.currency)
            .replace('#AMOUNT#', cleanDecimalString(row.amount)),
        // b: acquired date
        b: formatMultiDateString(row.acquiredDates, datesFormat, {
            format: multiDatesFormat,
            text: multiDatesText,
            separator: multiDatesSeparator,
        }),
        // c: sold date
        c: formatDateString(row.soldDate, datesFormat),
        // d: price sold
        d: (row.soldFor / rate).toFixed(2),
        // e: purchase cost
        e: (row.totalCost / rate).toFixed(2),
        // f: code
        f: '',
        // g: adjustment
        g: '',
        // h: gain
        h: (row.gain / rate).toFixed(2),
    }));
}

/**
 * Export the Form8949 data into a csv file
 * @param taxData {{partI: Object[], partII: Object[]}} data formatted for Form8949
 * @param taxYear {string|Number} tax year (only used to generate the default filename
 * @param filename {string} filename to use for the export file
 */
export const exportTaxDataCsv = ({taxData, taxYear, filename}) => {
    exportCsvFile({
        exportData: [...taxData.partI, ...taxData.partII],
        filename: filename ?? 'RevoScopeExport_' + taxYear + '_' + (moment().format('YYYY-MM-DD_HH-mm-ss')) + '.csv',
    });
}
