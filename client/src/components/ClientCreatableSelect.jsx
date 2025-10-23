'use client';

import CreatableSelect from 'react-select/creatable';

export default function ClientCreatableSelect(props) {
    // Styles for react-select to match your dark theme
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: '#374151', // bg-gray-700
            borderColor: '#4B5563', // border-gray-600
            color: '#F9FAFB', // text-gray-50
            boxShadow: state.isFocused ? '0 0 0 2px #10B981' : 'none', // focus:ring-green-500
            '&:hover': {
                borderColor: '#6B7280', // hover:border-gray-500
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#F9FAFB', // text-gray-50
        }),
        input: (provided) => ({
            ...provided,
            color: '#F9FAFB', // text-gray-50
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#D1D5DB', // text-gray-400
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#374151', // bg-gray-700
            borderColor: '#4B5563', // border-gray-600
            zIndex: 9999 // Ensure dropdown is on top
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#1F2937' : (state.isSelected ? '#10B981' : '#374151'), // bg-gray-800 on hover, bg-green-500 on selected
            color: '#F9FAFB',
            '&:active': {
                backgroundColor: '#059669', // bg-green-600 on active
            },
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#10B981', // bg-green-500
            color: '#1F2937', // text-gray-800
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#1F2937', // text-gray-800
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#1F2937', // text-gray-800
            '&:hover': {
                backgroundColor: '#059669', // bg-green-600
                color: '#F9FAFB',
            },
        }),
    };

    return <CreatableSelect styles={customStyles} {...props} />;
}