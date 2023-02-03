export const resizeGrid = columnApi => {
    setTimeout(() => {
        if (!columnApi) {
            return;
        }
        columnApi.autoSizeAllColumns();
    }, 5);
}