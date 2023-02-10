import papaparse from 'papaparse';

/**
 * Generates a Csv file and causes the browser to download it
 * @param exportData {Object[]} array of rows to export in the csv file
 * @param filename {string} default filename for the download of the file generated
 */
export const exportCsvFile = ({exportData, filename}) => {
    const blob = new Blob([papaparse.unparse(exportData)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const tag = document.createElement('a');
    tag.href = url;
    tag.setAttribute('download', filename);
    tag.click();
}
