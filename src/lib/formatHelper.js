// DATE_FORMAT_* constants used to select the dateformat
export const DATE_FORMAT_DD_MM_YYYY = 'DD/MM/YYYY';
export const DATE_FORMAT_MM_DD_YYYY = 'MM/DD/YYYY';
export const DATE_FORMAT_YYYY_MM_DD = 'YYYY-MM-DD';

// MULTI_DATES_* constants to control how to render multiple dates
// Form8949 expect the word "VARIOUS" be used instead of the date when there are multiple dates for the purchase date
export const MULTI_DATES_STATIC = 'Static Text';
export const MULTI_DATES_ALL = 'All';
export const MULTI_DATES_FIRST_LAST = 'First and Last';
export const MULTI_DATES_FIRST = 'First';
export const MULTI_DATES_LAST = 'Last';

/**
 * Removes artefact noise decimals introduced by the imprecision of the "flot" type
 * in short, convert 0.1234560000000000001 to "0.123456"
 * @param value {Number}
 * @returns {string}
 */
export const cleanDecimalString = value => {
    const decimalsString = value.toString().replace(/^-?[0-9]+\./, '');
    const significantAmountDecimals = Math.min(
        (decimalsString.replace(/^(0*[1-9][0-9]*[^0])0{5,}[0-9]{0,4}$/, "$1")).length, // trim trailing "0"
        (decimalsString.replace(/^(0*[1-9][0-9]*[^9])9{5,}[0-9]{0,4}$/, "$1")).length, // trim trailing "9"
        (decimalsString.replace(/^(0*[1-9][0-9]*[^3]33)3{5,}[0-9]{0,4}$/, "$1")).length, // trim trailing "9"
        (decimalsString.replace(/^(0*[1-9][0-9]*[^6]66)6{5,}[0-9]{0,4}$/, "$1")).length, // trim trailing "9"
        decimalsString.length,
    );
    return value.toFixed(significantAmountDecimals);
}

/**
 * Converts dates from the format "YYYY-MM-DD" to the chosen format (DD/MM/YYYY or MM/DD/YYYY)
 * @param dateString {string} date in the string format "YYYY-MM-DD"
 * @param format {string} a date format constant
 * @returns {string}
 */
export const formatDateString = (dateString, format) => {
    switch (format) {
        case DATE_FORMAT_DD_MM_YYYY:
            return dateString.substring(8,10) + '/' +  dateString.substring(5,7) + '/' + dateString.substring(0,4);
        case DATE_FORMAT_MM_DD_YYYY:
            return dateString.substring(5,7) + '/' +  dateString.substring(8,10) + '/' + dateString.substring(0,4);
        default: return dateString;
    }
}

/**
 * Handles the rendering of multiple dates array into a string
 * @param dates {string[]} array of dates in the string format "YYYY-MM-DD"
 * @param datesFormat {string} constant that selects the date format to use (DATE_FORMAT_* constants)
 * @param format {string} constant that selects how to handle multiple dates (MULTI_DATES_* constants)
 * @param text {string} optional text replacement for replacing the date by static text (Form8949 uses "VARIOUS" here)
 * @param separator {string} optional separator to use between the dates when joining multiple dates
 * @returns {*|string}
 */
export const formatMultiDateString = (dates, datesFormat, {format, text, separator}) => {
    if ((!dates) || (dates.length === 0)) return '';
    if (dates.length === 1) return formatDateString(dates[0], datesFormat);

    const dateStrings = dates.sort().map(item => formatDateString(item, datesFormat));
    switch (format) {
        case MULTI_DATES_STATIC:
            return text;
        case MULTI_DATES_FIRST_LAST:
            return dateStrings[0] + separator + dateStrings[dateStrings.length - 1];
        case MULTI_DATES_FIRST:
            return dateStrings[0];
        case MULTI_DATES_LAST:
            return dateStrings[dateStrings.length - 1];
        default:
            return dateStrings.join(separator);
    }
}

/**
 * converts negative numbers to string of number between parenthesis
 * @param value {Number} number to convert
 * @param toFixed {int} number of decimals to use
 * @returns {string}
 */
export const formatNumberWithParenthesis = (value, toFixed = 2) => {
    if (typeof value === 'undefined' || value === '' || value === null || isNaN(Number(value))) {
        return '';
    }
    if (Number(value) >= 0) return Number(value).toFixed(toFixed);
    else return '(' + Number(value).toFixed(toFixed).replace('-', '') + ')';
}
