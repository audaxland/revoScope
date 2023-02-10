import papaparse from 'papaparse';

/**
 * Generates a Csv file and causes the browser to download it
 * @param exportData {Object[]} array of rows to export in the csv file
 * @param filename {string} default filename for the download of the file generated
 */
export const exportCsvFile = ({exportData, filename}) => {
    triggerBrowserDownload({
        data: papaparse.unparse(exportData),
        type: 'text/csv;charset=utf-8;',
        filename
    });
}

/**
 * Cause the browser to download a file
 * @param data {string} content of the file for the download
 * @param type {string} content type header to add to the file
 * @param filename {string} name to give to the downloaded file
 */
export const triggerBrowserDownload = ({data, type = "text/csv;charset=utf-8;", filename}) => {
    const blob = new Blob([data], {type});
    const url = URL.createObjectURL(blob);

    const tag = document.createElement('a');
    tag.href = url;
    tag.setAttribute('download', filename ?? 'download.csv');
    tag.click();
}

/**
 * Cause the browser to download a static file from the app
 * @param path {string} path to the file to download
 * @param type {string} content type header to add to the file
 * @param filename {string} filename to give to the download file
 */
export const exportLocalFile = ({path, type = undefined, filename}) => {
    fetch(path)
        .then(res => res.text())
        .then(data => {
            triggerBrowserDownload({
                data,
                type,
                filename
            });
        });
}
