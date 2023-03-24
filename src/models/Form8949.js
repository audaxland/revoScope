import {PDFDocument} from 'pdf-lib';
import f8949_2019 from '../assets/form8949/f8949_2019.pdf';
import f8949_2020 from '../assets/form8949/f8949_2020.pdf';
import f8949_2021 from '../assets/form8949/f8949_2021.pdf';
import f8949_2022 from '../assets/form8949/f8949_2022.pdf';
import moment from "moment";
import {formatNumberWithParenthesis} from "../lib/formatHelper";

/**
 * pdf files for each tax year, that is the original form that will be populated by the app
 * @type {{"2019": *, "2022": *, "2021": *, "2020": *}}
 */
const yearForms = {
    2019: f8949_2019,
    2020: f8949_2020,
    2021: f8949_2021,
    2022: f8949_2022,
}

/**
 * A Form 8949 tax form pbf, that we populate with the sales data
 */
class Form8949
{
    /**
     * @param year {string|Number} the tax year of the form
     * @param taxData {{partI: Object[], partII: Object[]}} the prepared data to populate on the form
     * @param name {string} value to populate in the "name" field on the form
     * @param ssn {string} value to populate in the "ssn" field on the form
     */
    constructor({year, taxData, name, ssn}) {
        this.year = year;
        this.taxDataByCheckbox = {A: [], B: [], C: [], D: [], E: [], F: []};
        // as we need to have one form per checkbox that applies, we group the data by checkbox
        taxData.partI.forEach(row => {
            if (!this.taxDataByCheckbox[row.checkbox]) throw new Error('Unknown checkbox value: ' + row.checkbox);
            this.taxDataByCheckbox[row.checkbox].push({...row});
        });
        taxData.partII.forEach(row => {
            if (!this.taxDataByCheckbox[row.checkbox]) throw new Error('Unknown checkbox value: ' + row.checkbox);
            this.taxDataByCheckbox[row.checkbox].push({...row});
        });
        this.name = name;
        this.ssn = ssn;
        if (!yearForms[year]) {
            throw new Error('No tax form available for year: ' + year);
        }
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
     * @returns {*}
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
     * Generate the form pdf with the corresponding data for a given page
     * @param offset {int} offset to the first row to render (there are 14 rows per paf page)
     * @param partICheckbox {string} which checkbox to use for the first part of the form
     * @param partIICheckbox {string} which checkbox to use for the second part of the form
     * @returns {Promise<PDFDocument>}
     */
    async generateTaxFormPdfDoc({offset = 0, partICheckbox = 'C', partIICheckbox = 'F'}) {

        // get the data to render on this page of the form
        const partIRows = this.taxDataByCheckbox[partICheckbox]?.slice(offset, offset + 14) ?? [];
        const partIIRows = this.taxDataByCheckbox[partIICheckbox]?.slice(offset, offset + 14) ?? [];

        // calculate totals to place at the bottom on each part
        const partITotals = this.formatRowNumbers(this.getTotals(partIRows));
        const partIITotals = this.formatRowNumbers(this.getTotals(partIIRows));

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
        if (partIRows.length) {
            // populate the checkbox on the first page
            (partICheckbox === 'A') && form.getCheckBox('topmostSubform[0].Page1[0].c1_1[0]').check();
            (partICheckbox === 'B') && form.getCheckBox('topmostSubform[0].Page1[0].c1_1[1]').check();
            (partICheckbox === 'C') && form.getCheckBox('topmostSubform[0].Page1[0].c1_1[2]').check();

            // populate the rows on the first page
            partIRows.forEach((row, rowIndex) => {
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
                if (typeof partITotals[key] !== 'undefined') {
                    form.getTextField('topmostSubform[0].Page1[0].f1_' + cellNumber + '[0]')
                        .setText(partITotals[key]);
                }
            });
        }

        // populate the name and ssn on the second page
        form.getTextField('topmostSubform[0].Page2[0].f2_1[0]').setText(this.name);
        form.getTextField('topmostSubform[0].Page2[0].f2_2[0]').setText(this.ssn);

        // populate partII
        if (partIIRows.length) {
            // populate the checkbox on the second page
            (partIICheckbox === 'D') && form.getCheckBox('topmostSubform[0].Page2[0].c2_1[0]').check();
            (partIICheckbox === 'E') && form.getCheckBox('topmostSubform[0].Page2[0].c2_1[1]').check();
            (partIICheckbox === 'F') && form.getCheckBox('topmostSubform[0].Page2[0].c2_1[2]').check();

            // populate the rows on the second page
            partIIRows.forEach((row, rowIndex) => {
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
                if (typeof partIITotals[key] !== 'undefined') {
                    form.getTextField('topmostSubform[0].Page2[0].f2_' + cellNumber + '[0]')
                        .setText(partIITotals[key]);
                }
            });
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
     * @param part {'partI'|'partII'|'all'} which part of the form to generate
     * @returns {Promise<void>}
     */
    async downloadFormPdf ({page = 1, part = 'all'}) {
        const offset = (page - 1) * 14;
        const taxDoc = await this.generateTaxFormPdfDoc({offset});
        let partName = '';
        if (part === 'I') {
            taxDoc.removePage(1);
            partName = 'partI_';
        }
        if (part === 'II') {
            taxDoc.removePage(0);
            partName = 'partII_';
        }

        const filename = 'RevoForm8949_' + this.year + '_' + partName + page + '_' + (moment().format('YYYY-MM-DD_HH-mm-ss')) + '.pdf';
        await this.downloadPdf(taxDoc, filename);
    }
}

export default Form8949
