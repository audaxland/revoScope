import {cleanDecimalString} from "../../../lib/formatHelper";

/**
 * resizeGrid() will cause the automatic resizing of the columns visible on the grid
 * @param columnApi
 */
export const resizeGrid = columnApi => {
    setTimeout(() => {
        if (!columnApi) {
            return;
        }
        columnApi.autoSizeAllColumns();
        // only the visible columns are resized, so after the first resize more columns can be visible and therefore resizeable
        // so run the resize again to also resize the possible extra columns
        columnApi.autoSizeAllColumns();
    }, 5);
}

/**
 * This is a value getter to be used in the gird columns definitions 'valueGetter' setting,
 * this will convert a float to a string without the unnecessary decimals introduces be the imprecision of the flot type
 * e.g. replace 0.12346000000000000001 by '0.123456'
 * @param field
 * @returns {function({data: *}): *}
 */
export const cleanDecimal = field => ({data}) => cleanDecimalString(data[field])
