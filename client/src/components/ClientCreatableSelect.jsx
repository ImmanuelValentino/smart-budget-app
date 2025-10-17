// src/components/ClientCreatableSelect.jsx
'use client'; // Pastikan ini ada di paling atas

import CreatableSelect from 'react-select/creatable';

// Ini adalah komponen wrapper yang hanya akan dirender di sisi client
export default function ClientCreatableSelect(props) {
    return <CreatableSelect {...props} />;
}