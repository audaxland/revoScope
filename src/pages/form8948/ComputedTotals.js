import TitledBox from "../../elements/boxes/TitledBox";
import FlexWrapSection from "../../elements/boxes/FlexWrapSection";
import Form8949TotalsTable from "../../elements/tables/Form8949TotalsTable";

/**
 * Renders tables with the totals of sales, cost and gain for the data computed by the RevoScope app
 * @param taxYear {string|number} year currently selected on the page
 * @param referenceCurrency {string} the reference currency set for the app
 * @param salesTotals {Object} sales data to render
 * @returns {JSX.Element}
 * @constructor
 */
const ComputedTotals = ({taxYear, referenceCurrency, salesTotals}) => {
    return (
        <TitledBox title={`Computed totals for Form 8949 - Year ${taxYear}`}>
            <FlexWrapSection title={`Totals computed from the RevoScope data`}>
                <Form8949TotalsTable
                    cornerCell={<div className='text-right font-bold px-3'>Totals in {referenceCurrency}</div>}
                    currency={referenceCurrency}
                    shortTermTotals={salesTotals.shortTermTotals}
                    longTermTotals={salesTotals.longTermTotals}
                />
                {(referenceCurrency !== 'USD') && (
                    <Form8949TotalsTable
                        cornerCell={<div className='text-right font-bold px-3'>Totals in USD</div>}
                        currency='USD'
                        shortTermTotals={salesTotals.shortTermTotalsUsd}
                        longTermTotals={salesTotals.longTermTotalsUsd}
                    />
                )}
            </FlexWrapSection>
        </TitledBox>
    )
}

export default ComputedTotals
