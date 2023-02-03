export const DATE_FORMAT_DD_MM_YYYY = 'DD/MM/YYYY';
export const DATE_FORMAT_MM_DD_YYYY = 'MM/DD/YYYY';
export const DATE_FORMAT_YYYY_MM_DD = 'YYYY-MM-DD';

export const MULTI_DATES_STATIC = 'Static Text';
export const MULTI_DATES_ALL = 'All';
export const MULTI_DATES_FIRST_LAST = 'First and Last';
export const MULTI_DATES_FIRST = 'First';
export const MULTI_DATES_LAST = 'Last';

export const cleanDecimalString = value => {
    const decimalsString = value.toString().replace(/^[0-9]+\./, '');
    const significantAmountDecimals = Math.min(
        (decimalsString.replace(/^(0*[1-9][0-9]*[^0])0{5,}[1-9]{0,4}$/, "$1")).length, // trim trailing "0"
        (decimalsString.replace(/^(0*[1-9][0-9]*[^9])9{5,}[0-8]{0,4}$/, "$1")).length, // trim trailing "9"
        decimalsString.length,
    );
    return value.toFixed(significantAmountDecimals);
}

export const formatDateString = (dateString, format) => {
    switch (format) {
        case DATE_FORMAT_DD_MM_YYYY:
            return dateString.substring(8,10) + '/' +  dateString.substring(5,7) + '/' + dateString.substring(0,4);
        case DATE_FORMAT_MM_DD_YYYY:
            return dateString.substring(5,7) + '/' +  dateString.substring(8,10) + '/' + dateString.substring(0,4);
        default: return dateString;
    }
}

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

export const formatNumberWithParenthesis = (value, toFixed = 2) => {
    if (typeof value === 'undefined' || value === '' || value === null || isNaN(Number(value))) {
        return '';
    }
    if (Number(value) >= 0) return Number(value).toFixed(toFixed);
    else return '(' + Number(value).toFixed(toFixed).replace('-', '') + ')';
}
