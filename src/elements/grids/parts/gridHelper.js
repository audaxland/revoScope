import {cleanDecimalString} from "../../../lib/formatHelper";

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

export const cleanDecimal = field => ({data}) => cleanDecimalString(data[field])
