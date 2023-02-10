import {Option, Select} from "@material-tailwind/react";

/**
 * Renders a dropdown menu based on an array of options
 * @param options {String[]|Object[]} array of values or object of {<label>: <value>, ...} options to select from
 * @param value {string} selected value
 * @param onChange {function} callback to call for the onChange event
 * @param label {string} label to show on the Select menu
 * @returns {JSX.Element}
 * @constructor
 */
const DropDown = ({options, value, onChange, label}) => {
    // if options is an array, use
    const optionsSet = Array.isArray(options)
        ? options.map(option => ({label: option, value: option}))
        : Object.entries(options).map(([label, value]) => ({label, value}));
    return (
        <Select
            label={label}
            className='bg-white/80 text-black/90'
            onChange={onChange}
            value={value}
        >
            {optionsSet.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
        </Select>
    );
}

export default DropDown;
