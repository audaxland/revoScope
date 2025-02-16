import TitledBox from "../../elements/boxes/TitledBox";
import DropDown from "../../elements/inputs/DropDown";
import {Input} from "@material-tailwind/react";
import {
    DATE_FORMAT_DD_MM_YYYY,
    DATE_FORMAT_MM_DD_YYYY,
    DATE_FORMAT_YYYY_MM_DD, MULTI_DATES_ALL, MULTI_DATES_FIRST, MULTI_DATES_FIRST_LAST, MULTI_DATES_LAST,
    MULTI_DATES_STATIC
} from "../../lib/formatHelper";

/**
 * Renders the form for the user to input what settings are to be used when generating the form 8949 files
 * @param formSettings {Object} list of settings that the user will set here
 * @param setFormSettings {function} setter to update the state of the formSettings
 * @returns {JSX.Element}
 * @constructor
 */
const Form8949SettingsSection = ({formSettings, setFormSettings}) => {
    const {
        descriptionFormat,
        datesFormat,
        multiDatesFormat,
        multiDatesText,
        multiDatesSeparator,
        name,
        ssn
    } = formSettings;

    const updateSetting = setting => value => {
        setFormSettings(old => ({...old, [setting]: value}));
    }

    return (
        <TitledBox title='Settings for Form 8949'>

            <div className='flex flex-row gap-3 items-center'>
                <div className='flex w-60'>Description format</div>
                <div className='w-60'>
                    <Input
                        label="Description"
                        className='bg-white/80 text-black/90'
                        value={descriptionFormat}
                        onChange={e => updateSetting('descriptionFormat')(e.target.value)}
                    />
                </div>
            </div>

            <div className='flex flex-row gap-3 items-center'>
                <div className='flex w-60'>Dates Format</div>
                <div className='w-60'>
                    <DropDown
                        label="Dates Format"
                        options={[DATE_FORMAT_MM_DD_YYYY, DATE_FORMAT_DD_MM_YYYY, DATE_FORMAT_YYYY_MM_DD]}
                        value={datesFormat}
                        onChange={updateSetting('datesFormat')}
                    />
                </div>
            </div>

            <div className='flex flex-row gap-3 items-top border-b border-indigo-300/50 pb-5'>
                <div className='flex w-60 mt-2'>Multi Dates Format</div>
                <div className='w-60 flex flex-col gap-3'>
                    <DropDown
                        label="Multi Dates Format"
                        options={[MULTI_DATES_STATIC, MULTI_DATES_ALL, MULTI_DATES_FIRST_LAST, MULTI_DATES_FIRST, MULTI_DATES_LAST]}
                        value={multiDatesFormat}
                        onChange={updateSetting('multiDatesFormat')}
                    />
                    {(multiDatesFormat === MULTI_DATES_STATIC) && (
                        <Input
                            label="Static Text"
                            className='bg-white/80 text-black/90'
                            value={multiDatesText}
                            onChange={e => updateSetting('multiDatesText')(e.target.value)}
                        />
                    )}
                    {(multiDatesFormat !== MULTI_DATES_STATIC) && (
                        <Input
                            label="Separator"
                            className='bg-white/80 text-black/90'
                            value={multiDatesSeparator}
                            onChange={e => updateSetting('multiDatesSeparator')(e.target.value)}
                        />
                    )}
                </div>
            </div>

            <div className='flex flex-row gap-3 items-center'>
                <div className='flex w-60'>Name on Form</div>
                <div className='w-60'>
                    <Input
                        label="Name"
                        className='bg-white/80 text-black/90'
                        value={name}
                        onChange={e => updateSetting('name')(e.target.value)}
                    />
                </div>
            </div>

            <div className='flex flex-row gap-3 items-center'>
                <div className='flex w-60'>SSN on Form</div>
                <div className='w-60'>
                    <Input
                        label="SSN"
                        className='bg-white/80 text-black/90'
                        value={ssn}
                        onChange={e => updateSetting('ssn')(e.target.value)}
                    />
                </div>
            </div>
        </TitledBox>
    )
}

export default Form8949SettingsSection
