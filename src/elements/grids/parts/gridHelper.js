import {cleanDecimalString} from "../../../lib/formatHelper";

export const resizeGrid = columnApi => {
    setTimeout(() => {
        if (!columnApi) {
            return;
        }
        columnApi.autoSizeAllColumns();
    }, 5);
}

export const cleanDecimal = field => ({data}) => cleanDecimalString(data[field])
