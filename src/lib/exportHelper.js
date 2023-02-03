import papaparse from 'papaparse';

export const exportCsvFile = ({exportData, filename}) => {
    const blob = new Blob([papaparse.unparse(exportData)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const tag = document.createElement('a');
    tag.href = url;
    tag.setAttribute('download', filename);
    tag.click();


}
