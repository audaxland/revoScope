/**
 * The IRS forms have changed format in 2025, so the mapping of the fields and the list of checkboxes have changed
 * The returned object contains the mappings for the pdf file depending on the year of the form.
 * @param year
 * @returns {{partTwoCheckboxes: string[], pdfFields: {p1RowBase: string, totalsOffset: number, p2Name: string, p2RowBase: string, p1TotalsBase: string, p1Name: string, padSize: number, p1Ssn: string, p1CheckboxBase: string, p2CheckboxBase: string, p2Ssn: string, p2TotalsBase: string}, partOneCheckboxes: string[], rowsPerPage: number}}
 */
export const getFormConfig = year => {
    if (year < 2025) {
        return {
            rowsPerPage: 14,
            partOneCheckboxes: ['A', 'B', 'C'],
            partTwoCheckboxes: ['D', 'E', 'F'],
            pdfFields: {
                padSize: 0,
                totalsOffset: 115,
                p1Name: 'topmostSubform[0].Page1[0].f1_1[0]',
                p2Name: 'topmostSubform[0].Page2[0].f2_1[0]',
                p1Ssn: 'topmostSubform[0].Page1[0].f1_2[0]',
                p2Ssn: 'topmostSubform[0].Page2[0].f2_2[0]',
                p1CheckboxBase: 'topmostSubform[0].Page1[0].c1_1',
                p2CheckboxBase : 'topmostSubform[0].Page1[0].c1_1',
                p1RowBase: 'topmostSubform[0].Page1[0].Table_Line1[0].Row',
                p2RowBase: 'topmostSubform[0].Page2[0].Table_Line1[0].Row',
                p1TotalsBase: 'topmostSubform[0].Page1[0].f1_',
                p2TotalsBase: 'topmostSubform[0].Page2[0].f2_',
            }

        }
    } else {
        return {
            rowsPerPage: 11,
            partOneCheckboxes: ['A', 'B', 'C', 'G', 'H', 'I'],
            partTwoCheckboxes: ['D', 'E', 'F', 'J', 'K', 'L'],
            pdfFields: {
                padSize: 2,
                totalsOffset: 91,
                p1Name: 'topmostSubform[0].Page1[0].f1_01[0]',
                p2Name: 'topmostSubform[0].Page2[0].f2_01[0]',
                p1Ssn: 'topmostSubform[0].Page1[0].f1_02[0]',
                p2Ssn: 'topmostSubform[0].Page2[0].f2_02[0]',
                p1CheckboxBase: 'topmostSubform[0].Page1[0].c1_1',
                p2CheckboxBase : 'topmostSubform[0].Page2[0].c2_1',
                p1RowBase: 'topmostSubform[0].Page1[0].Table_Line1_Part1[0].Row',
                p2RowBase: 'topmostSubform[0].Page2[0].Table_Line1_Part2[0].Row',
                p1TotalsBase: 'topmostSubform[0].Page1[0].f1_',
                p2TotalsBase: 'topmostSubform[0].Page2[0].f2_',
            }
        }
    }
}

export const getDefaultPartICheckbox = year => year < 2025 ? 'C' : 'I';
export const getDefaultPartIICheckbox = year => year < 2025 ? 'F' : 'L';
