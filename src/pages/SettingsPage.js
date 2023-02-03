import TitledBox from "../elements/boxes/TitledBox";
import DropDown from "../elements/inputs/DropDown";
import {taxYearExchangeRates} from "../lib/taxesHelper";
import {useState} from "react";
import {Button, Input} from "@material-tailwind/react";
import {useSettingsContext} from "../store/SettingsContext";

const SettingsPage = () => {
    const {referenceCurrency, changeReferenceCurrency} = useSettingsContext();
    const dropdownCurrencies = [...[...Object.keys(taxYearExchangeRates), 'USD'].sort(), 'Other'];
    const [currency, setCurrency] = useState(() => dropdownCurrencies.includes(referenceCurrency) ? referenceCurrency : 'Other');
    const [otherCurrency, setOtherCurrency] = useState('');
    const [changed, setChanged] = useState(false);

    const changeCurrency = newCurrency => {
        setCurrency(newCurrency);
        setChanged(true);
    }
    const changeOtherCurrency = newCurrency => {
        setOtherCurrency(newCurrency);
        setChanged(true);
    }

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
