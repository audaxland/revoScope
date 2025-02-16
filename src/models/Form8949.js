import {PDFDocument} from 'pdf-lib';
import f8949_2019 from '../assets/form8949/f8949_2019.pdf';
import f8949_2020 from '../assets/form8949/f8949_2020.pdf';
import f8949_2021 from '../assets/form8949/f8949_2021.pdf';
import f8949_2022 from '../assets/form8949/f8949_2022.pdf';
import f8949_2023 from '../assets/form8949/f8949_2023.pdf';
import f8949_2024 from '../assets/form8949/f8949_2024.pdf';
import moment from "moment";
import {formatNumberWithParenthesis} from "../lib/formatHelper";
import {exportCsvFile} from "../lib/exportHelper";

/**
 * pdf files for each tax year, that is the original form that will be populated by the app
 * @type {{"2019": *, "2022": *, "2021": *, "2020": *, "2023": *, "2024": *}}
 */
const yearForms = {
    2019: f8949_2019,
    2020: f8949_2020,
    2021: f8949_2021,
    2022: f8949_2022,
    2023: f8949_2023,
    2024: f8949_2024,
}

/**
 * @type {string[]} List of years for which the app can generate a form 8949
 */
export const availableYears = Object.keys(yearForms).map(y => `${y}`).reverse()

/**
 * A Form 8949 tax form pbf, that we populate with the sales data
 */
class Form8949
{
    /**
     * @param year {string|Number} the tax year of the form
     * @param name {string} value to populate in the "name" field on the form
     * @param ssn {string} value to populate in the "ssn" field on the form
     */
    constructor({year, name, ssn}) {
        this.year = year;
        this.taxDataByCheckbox = {A: [], B: [], C: [], D: [], E: [], F: []};
        this.name = name;
        this.ssn = ssn;
        if (!yearForms[year]) {
            throw new Error('No tax form available for year: ' + year);
        }
    }

    /**
     * Add a list of records to be rendered in the generated form 8949 files
     * @param data {Object[]} list of records
     * @returns {Form8949}
     */
    addData(data) {
        const checkboxes = new Set()
        // only process the data if all records have a valid checkbox field
        data.forEach(row => {
            if (!this.taxDataByCheckbox[row.checkbox]) throw new Error('Unknown checkbox value: ' + row.checkbox);
            checkboxes.add(row.checkbox);
        });
        data.forEach(row => {
            this.taxDataByCheckbox[row.checkbox].push({...row});
        });
        // sort by sale date
        checkboxes.forEach(k => {
            this.taxDataByCheckbox[k] = this.taxDataByCheckbox[k].sort((a, b) => a.c.localeCompare(b.c));
        });
        return this;
    }

    /**
     * Convert the possible negative numbers in a row to the parenthesis form
     * @param row {Object} row of data going on the form
     * @returns {Object}
     */
    formatRowNumbers (row) {
        const newRow = {...row};
        newRow.d = formatNumberWithParenthesis(row.d);
        newRow.e = formatNumberWithParenthesis(row.e);
        newRow.g = formatNumberWithParenthesis(row.g);
        newRow.h = formatNumberWithParenthesis(row.h);
        return newRow;
    }

    /**
     * Generate totals to place at the bottom of the Part section (that is the total for the 14 rows on the page)
     * @param rows {Object[]} list of rows that go on a page
     * @returns {Object}
     */
    getTotals (rows) {
        return rows.reduce((prev, curr) => {
            prev.d += isNaN(Number(curr.d)) ? 0.0 : Number(curr.d);
            prev.e += isNaN(Number(curr.e)) ? 0.0 : Number(curr.e);
            prev.g += isNaN(Number(curr.g)) ? 0.0 : Number(curr.g);
            prev.h += isNaN(Number(curr.h)) ? 0.0 : Number(curr.h);
            return prev;
        }, {d: 0.0, e: 0.0, g: 0.0, h: 0.0})
    }

    /**
     * Returns the total sales, costs, adjustments and gains for a requested checkbox data
     * @param checkbox {'A'|'B'|'C'|'D'|'E'|'F'}
     * @returns {Object}
     */
    getGlobalTotals(checkbox) {
        return this.getTotals(this.taxDataByCheckbox[checkbox]);
    }

    /**
     * Exports the loaded records in a CSV file
     * @param filename {string|null} optional filename to set when the download is triggered.
     */
    exportToCsv(filename = null) {
        const exportData = [];
        Object.values(this.taxDataByCheckbox).forEach(checkboxArray => {
            checkboxArray.forEach(({checkbox, a, b, c, d, e, f, g, h}) => {
                const part = ['A', 'B', 'C'].includes(checkbox) ?
                    'PartI' : (['D', 'E', 'F'].includes(checkbox) ? 'PartII' : 'unknown');
                exportData.push({part, checkbox, a, b, c, d, e, f, g, h})
            })
        })

        const defaultFileName = 'RevoScopeExport_' + this.year + '_'
            + (moment().format('YYYY-MM-DD_HH-mm-ss')) + '.csv';

        // generate the csv and trigger the download
        exportCsvFile({
            exportData,
            filename: filename ?? defaultFileName,
        });
    }

    /**
     * Generate the form pdf with the corresponding data for a given page
     * @param offset {int} offset to the first row to render (there are 14 rows per paf page)
     * @param checkbox {'A'|'B'|'C'|'D'|'E'|'F'} which part of the form to generate
     * @returns {Promise<PDFDocument>}
     */
    async generateTaxFormPdfDoc({offset = 0, checkbox}) {

        // get the data to render on this page of the form
        const rows = this.taxDataByCheckbox[checkbox]?.slice(offset, offset + 14) ?? [];

        // calculate totals to place at the bottom on each part
        const pageTotals = this.formatRowNumbers(this.getTotals(rows));

        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const totals = ['d', 'e', 'f', 'g', 'h'];

        // get a fresh copy of the blank Form8949 form for that year
        const formPdfBytes = await fetch(yearForms[this.year]).then(res => res.arrayBuffer());
        const taxDoc = await PDFDocument.load(formPdfBytes);
        const form = taxDoc.getForm()

        // populate the checkbox on the first page
        form.getTextField('topmostSubform[0].Page1[0].f1_1[0]').setText(this.name);
        form.getTextField('topmostSubform[0].Page1[0].f1_2[0]').setText(this.ssn);

        // populate part I
        if (['A', 'B', 'C'].includes(checkbox)) {
            // populate the checkbox on the first page
            (checkbox === 'A') && form.getCheckBox('topmostSubform[0].Page1[0].c1_1[0]').check();
            (checkbox === 'B') && form.getCheckBox('topmostSubform[0].Page1[0].c1_1[1]').check();
            (checkbox === 'C') && form.getCheckBox('topmostSubform[0].Page1[0].c1_1[2]').check();

            // populate the rows on the first page
            rows.forEach((row, rowIndex) => {
                const formattedRow = this.formatRowNumbers(row);
                const rowReference = 3 + (8 * rowIndex);
                const rowName = 'topmostSubform[0].Page1[0].Table_Line1[0].Row' + (rowIndex + 1);
                columns.forEach((key, keyIndex) => {
                    if (typeof formattedRow[key] !== 'undefined') {
                        const cellName = rowName +'[0].f1_' + (rowReference + keyIndex) + '[0]';
                        form.getTextField(cellName).setText(formattedRow[key]);
                    }
                });
            });

            // populate the totals on the first page
            totals.forEach((key, keyIndex) => {
                const cellNumber = 115 + keyIndex;
                if (typeof pageTotals[key] !== 'undefined') {
                    form.getTextField('topmostSubform[0].Page1[0].f1_' + cellNumber + '[0]')
                        .setText(pageTotals[key]);
                }
            });
            taxDoc.removePage(1);
        }

        // populate the name and ssn on the second page
        form.getTextField('topmostSubform[0].Page2[0].f2_1[0]').setText(this.name);
        form.getTextField('topmostSubform[0].Page2[0].f2_2[0]').setText(this.ssn);

        // populate partII
        if (['D', 'E', 'F'].includes(checkbox)) {
            // populate the checkbox on the second page
            (checkbox === 'D') && form.getCheckBox('topmostSubform[0].Page2[0].c2_1[0]').check();
            (checkbox === 'E') && form.getCheckBox('topmostSubform[0].Page2[0].c2_1[1]').check();
            (checkbox === 'F') && form.getCheckBox('topmostSubform[0].Page2[0].c2_1[2]').check();

            // populate the rows on the second page
            rows.forEach((row, rowIndex) => {
                const formattedRow = this.formatRowNumbers(row);
                const rowReference = 3 + (8 * rowIndex);
                const rowName = 'topmostSubform[0].Page2[0].Table_Line1[0].Row' + (rowIndex + 1);
                columns.forEach((key, keyIndex) => {
                    if (typeof formattedRow[key] !== 'undefined') {
                        const cellName = rowName +'[0].f2_' + (rowReference + keyIndex) + '[0]';
                        form.getTextField(cellName).setText(formattedRow[key]);
                    }
                });
            });

            // populate the totals on the second page
            totals.forEach((key, keyIndex) => {
                const cellNumber = 115 + keyIndex;
                if (typeof pageTotals[key] !== 'undefined') {
                    form.getTextField('topmostSubform[0].Page2[0].f2_' + cellNumber + '[0]')
                        .setText(pageTotals[key]);
                }
            });
            taxDoc.removePage(0);
        }

        return taxDoc;
    }

    /**
     * Cause the pfd resource to be downloaded by the browser
     * @param pdfDoc {PDFDocument} pfd document resource
     * @param fileName {string|null} filename that the browser should download the file as
     * @returns {Promise<void>}
     */
    async downloadPdf (pdfDoc, fileName = null) {
        const pdfBytes = await pdfDoc.save();
        this.downloadPdfBytes(pdfBytes, fileName);
    }

    /**
     * Cause the download by the browser of pdfBytes into a pdf file
     * @param content pdf bytes of the file
     * @param fileName {string|null} filename that browser should give to the file
     */
    downloadPdfBytes (content, fileName = null) {
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const tag = document.createElement('a');
        tag.href = url;
        const exportFileName = fileName ? fileName : 'RevoForm8949_' + this.year + '_' + (moment().format('YYYY-MM-DD_HH-mm-ss')) + '.pdf'
        tag.setAttribute('download', exportFileName);
        tag.click();
    }

    /***
     * Generates a page of the pdf of Form 8949 and makes the browser download it
     * @param page {int} page number to generate
     * @param checkbox {'A'|'B'|'C'|'D'|'E'|'F'} which part of the form to generate
     * @returns {Promise<void>}
     */
    async downloadFormPdf ({page = 1, checkbox}) {
        const offset = (page - 1) * 14;
        const taxDoc = await this.generateTaxFormPdfDoc({offset, checkbox});
        let partName = '';
        if (['A', 'B', 'C'].includes(checkbox)) {
            partName = 'partI_' ;
        }
        if (['D', 'E', 'F'].includes(checkbox)) {
            partName = 'partII_';
        }

        const filename = (
            'RevoForm8949_' + this.year + '_'
            + partName + '_' + checkbox + '_' + page + '_'
            + (moment().format('YYYY-MM-DD_HH-mm-ss')) + '.pdf'
        );
        await this.downloadPdf(taxDoc, filename);
    }
}

export default Form8949
