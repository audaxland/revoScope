import {PDFDocument} from 'pdf-lib';
import f8949_2019 from '../assets/form8949/f8949_2019.pdf';
import f8949_2020 from '../assets/form8949/f8949_2020.pdf';
import f8949_2021 from '../assets/form8949/f8949_2021.pdf';
import f8949_2022 from '../assets/form8949/f8949_2022.pdf';
import moment from "moment";
import {formatNumberWithParenthesis} from "../lib/formatHelper";

const yearForms = {
    2019: f8949_2019,
    2020: f8949_2020,
    2021: f8949_2021,
    2022: f8949_2022,
}
class Form8949
{
    constructor({year, taxData, name, ssn}) {
        this.year = year;
        this.taxDataByCheckbox = {A: [], B: [], C: [], D: [], E: [], F: []};
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
    formatRowNumbers (row) {
        const newRow = {...row};
        newRow.d = formatNumberWithParenthesis(row.d);
        newRow.e = formatNumberWithParenthesis(row.e);
        newRow.g = formatNumberWithParenthesis(row.g);
        newRow.h = formatNumberWithParenthesis(row.h);
        return newRow;
    }

    getTotals (rows) {
        return rows.reduce((prev, curr) => {
            prev.d += isNaN(Number(curr.d)) ? 0.0 : Number(curr.d);
            prev.e += isNaN(Number(curr.e)) ? 0.0 : Number(curr.e);
            prev.g += isNaN(Number(curr.g)) ? 0.0 : Number(curr.g);
            prev.h += isNaN(Number(curr.h)) ? 0.0 : Number(curr.h);
            return prev;
        }, {d: 0.0, e: 0.0, g: 0.0, h: 0.0})
    }

    async generateTaxFormPdfDoc({offset = 0, partICheckbox = 'A', partIICheckbox = 'D'}) {

        const partIRows = this.taxDataByCheckbox[partICheckbox]?.slice(offset, offset + 14) ?? [];
        const partIIRows = this.taxDataByCheckbox[partIICheckbox]?.slice(offset, offset + 14) ?? [];

        const partITotals = this.formatRowNumbers(this.getTotals(partIRows));
        const partIITotals = this.formatRowNumbers(this.getTotals(partIIRows));

        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const totals = ['d', 'e', 'f', 'g', 'h'];

        const formPdfBytes = await fetch(yearForms[this.year]).then(res => res.arrayBuffer());
        const taxDoc = await PDFDocument.load(formPdfBytes);
        const form = taxDoc.getForm()

        // populate the checkbox on the first page
        form.getTextField('topmostSubform[0].Page1[0].f1_1[0]').setText(this.name);
        form.getTextField('topmostSubform[0].Page1[0].f1_2[0]').setText(this.ssn);

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

    async downloadPdf (pdfDoc, fileName = null) {
        const pdfBytes = await pdfDoc.save();
        this.downloadPdfBytes(pdfBytes, fileName);
    }
    downloadPdfBytes (content, fileName = null) {
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const tag = document.createElement('a');
        tag.href = url;
        const exportFileName = fileName ? fileName : 'RevoForm8949_' + this.year + '_' + (moment().format('YYYY-MM-DD_HH-mm-ss')) + '.pdf'
        tag.setAttribute('download', exportFileName);
        tag.click();
    }

    async downloadFormPdf ({page = 1, part = 'all'}) {
        const offset = (page - 1) * 14;
        const taxDoc = await this.generateTaxFormPdfDoc({offset});
        if (part === 'I') taxDoc.removePage(1);
        if (part === 'II') taxDoc.removePage(0);

        await this.downloadPdf(taxDoc);
    }
}

export default Form8949
