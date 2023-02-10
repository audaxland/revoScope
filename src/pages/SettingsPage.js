import TitledBox from "../elements/boxes/TitledBox";
import DropDown from "../elements/inputs/DropDown";
import {taxYearExchangeRates} from "../lib/taxesHelper";
import {useState} from "react";
import {Button, Input} from "@material-tailwind/react";
import {useSettingsContext} from "../store/SettingsContext";

/**
 * Renders the "Settings" page
 * @returns {JSX.Element}
 * @constructor
 */
const SettingsPage = () => {
    /**
     * referenceCurrency: is your local or base currency you used to buy/sell all your cryptocurrency assets
     * @type {{referenceCurrency: string, changeReferenceCurrency: function}}
     */
    const {referenceCurrency, changeReferenceCurrency} = useSettingsContext();

    /**
     * @type {string[]} list of options to render in the "Currency" dropdown menu
     */
    const dropdownCurrencies = [...[...Object.keys(taxYearExchangeRates), 'USD'].sort(), 'Other'];

    /**
     * @type {[string, function]} currency: the currency currently selected in the dropdown menu
     */
    const [currency, setCurrency] = useState(() => dropdownCurrencies.includes(referenceCurrency) ? referenceCurrency : 'Other');

    /**
     * @type {[string, function]} otherCurrency: state for the text field to enter a currency when selecting 'Other' in the dropdown
     */
    const [otherCurrency, setOtherCurrency] = useState('');

    /**
     * @type {[boolean, function]} changed: tracks if the save button must be enabled or disabled
     */
    const [changed, setChanged] = useState(false);

    /**
     * handle the currency dropdown onChange event
     * @param newCurrency {string} new currency selected
     */
    const changeCurrency = newCurrency => {
        setCurrency(newCurrency);
        setChanged(true);
    }

    /**
     * handles the other currency text input onChange event
     * @param newCurrency {string} currency entered by the user
     */
    const changeOtherCurrency = newCurrency => {
        setOtherCurrency(newCurrency);
        setChanged(true);
    }

    /**
     * saves the new currency in the context (and local storage)
     */
    const saveChanges = () => {
        changeReferenceCurrency((currency === 'Other') ? otherCurrency : currency);
        setChanged(false)
    }

    return (
        <div>
            <TitledBox title="App settings">
                <div className='flex flex-col gap-3'>
                    <p>Select your local currency, this is the fiat currency you used to buy/sell all your crypto assets:</p>
                    <div className='flex flex-row gap-3 items-center'>
                        <div className='flex w-60'>Your local currency:</div>
                        <div className='w-60'>
                            <DropDown
                                label="Currency"
                                options={dropdownCurrencies}
                                value={currency}
                                onChange={changeCurrency}
                            />
                        </div>
                    </div>
                    {(currency === 'Other') && (
                        <div className='flex flex-row gap-3 items-center'>
                            <div className='flex w-60'>Specify currency:</div>
                            <div className='w-60'>
                                <Input
                                    label="Specify Currency"
                                    className='bg-white/80 text-black/90'
                                    value={otherCurrency}
                                    onChange={e => changeOtherCurrency(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <Button
                    disabled={!changed}
                    onClick={saveChanges}
                >
                    {changed ? 'Save Changes' : 'Saved'}
                </Button>
            </TitledBox>
        </div>
    );
}

export default SettingsPage;
