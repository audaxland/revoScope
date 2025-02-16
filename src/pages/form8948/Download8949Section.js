import TitledBox from "../../elements/boxes/TitledBox";
import FlexWrapSection from "../../elements/boxes/FlexWrapSection";
import {Button} from "@material-tailwind/react";
import AlertErrors from "../../elements/alerts/AlertErrors";
import {useMemo, useState} from "react";
import TwoDimensionTable from "../../elements/tables/TwoDimensionTable";

/**
 * Renders a list of buttons to download the form 8949 pdf files for a given checkbox
 * @param part {string} either PartI or PartII of form 8949
 * @param checkbox {'A'|'B'|'C'|'D'|'E'|'F'} which checkbox will be selected on the form
 * @param form {Form8949} instance of the Form8949 that contains the data and the download methods
 * @param setErrors {function} state setter to send the errors back to the parent component
 * @returns {JSX.Element|null}
 * @constructor
 */
const DownloadCheckboxSection = ({part, checkbox, form, setErrors}) => {
    const nbPages = useMemo(() => (
        Math.ceil(form.taxDataByCheckbox[checkbox].length / 14)
    ), [form, checkbox])

    if (nbPages === 0) return null;

    /**
     * Generate a pdf page of Form8949 and make it download it
     * @param page {number} page number to generate
     * @param checkbox {'A'|'B'|'C'|'D'|'E'|'F'} which part of the form to generate
     * @returns {(function(): Promise<void>)|*}
     */
    const handleForm = ({page = 1, checkbox}) => async () => {
        try {
            setErrors([]);
            await form.downloadFormPdf({page, checkbox});
        } catch (error) {
            setErrors(old => [...old, error?.message ?? 'An error occurred!']);
        }
    }

    return (
        <div>
            <h5 className='text-sm font-bold m-1'>
                {part} - Checkbox {checkbox} - {nbPages} page{nbPages > 1 ? 's' : ''}
            </h5>
            {[...Array(nbPages)].map((_,p) => (
                <Button
                    size="sm"
                    className="min-w-[9em] m-1"
                    key={p}
                    onClick={handleForm({page: p + 1, checkbox})}
                >
                    {checkbox} - Page {p + 1}
                </Button>
            ))}
        </div>
    )
}

/**
 * Renders the Section where the form 8949 pdf files are downloadable,
 * this section also renders the totals and csv download button
 * @param taxYear {string|number} year selected for the form 8949 to render
 * @param form {Form8949} instance of the Form8949 class that contains the data and will generate the download files
 * @returns {JSX.Element}
 * @constructor
 */
const Download8949Section = ({taxYear, form}) => {
    /**
     * @type {[string[], function]} list of errors to display on the page
     */
    const [errors, setErrors] = useState([]);

    /**
     * @type {{}} contains the totals data for each checkbox that will be rendered in the totals table.
     */
    const totalsData = useMemo(() => {
        return ['A', 'B', 'C', 'D', 'E', 'F'].reduce((prev, checkbox) => {
            const part = ['A', 'B', 'C'].includes(checkbox) ?  'PartI - Short Term' : 'PartII - Long Term';
            const {d, e, g, h} = form.getGlobalTotals(checkbox)
            prev[`${part} - Checkbox ${checkbox}`] = {
                'Records Count': form.taxDataByCheckbox[checkbox].length,
                'Total Sale Price': `${d.toFixed(2)} USD`,
                'Total Cost': `${e.toFixed(2)} USD`,
                'Total Adjustment': `${g.toFixed(2)} USD`,
                'Total Gains': `${h.toFixed(2)} USD`,
            }
            return prev;
        }, {})
    }, [form]);

    return (
        <TitledBox title={`Download Form 8949 - Year ${taxYear}`}>
            <FlexWrapSection>
                <TwoDimensionTable
                    data={totalsData}
                    cornerCell={<div className='text-right font-bold px-3'>Totals per checkbox in USD</div>}
                />
            </FlexWrapSection>

            {(!!errors.length) && (
                <AlertErrors errors={errors} onClose={() => setErrors([])} />
            )}
            <FlexWrapSection title='Csv Export'>
                <Button
                    onClick={() => form.exportToCsv()}
                >Export Form 8949 Data as CSV File</Button>
            </FlexWrapSection>
            <FlexWrapSection title='Form 8949 PDF - Part I/Short Term Pages'>
                {['A', 'B', 'C'].map(checkbox => (
                    <DownloadCheckboxSection part='PartI' key={checkbox} {...{checkbox, form, setErrors}} />
                ))}
            </FlexWrapSection>

            <FlexWrapSection title='Form 8949 PDF - Part II/Long Term Pages'>
                {['D', 'E', 'F'].map(checkbox => (
                    <DownloadCheckboxSection part='PartII' key={checkbox} {...{checkbox, form, setErrors}} />
                ))}
            </FlexWrapSection>
        </TitledBox>
    )
}

export default Download8949Section
