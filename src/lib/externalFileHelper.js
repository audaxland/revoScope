import {readCsvUploadFile} from "./uploadHelper";

/**
 * Processes a csv file that the user uploads to provide additional records to include in the generated from 8949 pdf files.
 * @param newUpload {}
 * @returns {Promise<{externalRecords: *, fileHash: *, lastModified, name, size, type, countPerYear: *}>}
 */
export const readNewExternalFile = async newUpload => {
    const {csvContent, fileHash, lastModified, name, size, type} = await readCsvUploadFile(newUpload);
    const blankRecord = {fileHash, year: "", checkbox: "", a: "", b: "", c: "", d: "", e: "", f: "", g: "", h: ""};
    const externalRecords = csvContent.map(row => (
        Object.entries(row).reduce((prev, [k, v]) => {
            k = k.toLowerCase().trim();
            v = v.trim();
            if (k === 'checkbox') prev[k] = v.toUpperCase();
            if (['a', 'b', 'c', 'f'].includes(k)) prev[k] = v;
            if (k === 'c') prev['year'] = parseInt(v.match(/\d{4}$/)[0]);
            if (['d', 'e', 'g', 'h'].includes(k)) prev[k] = `${v}`.replace('(', '-').replaceAll(/[^0-9.-]/g, '');
            return prev;
        }, {...blankRecord})
    ));
    const countPerYear = externalRecords.reduce((prev, curr) => {
        prev[curr.year] = (prev[curr.year] ?? 0) + 1;
        return prev;
    }, {})
    return {externalRecords, fileHash, lastModified, name, size, type, countPerYear};
}