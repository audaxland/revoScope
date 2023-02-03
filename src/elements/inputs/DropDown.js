import {Option, Select} from "@material-tailwind/react";

const DropDown = ({options, value, onChange, label}) => {
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
