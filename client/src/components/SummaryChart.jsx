// src/components/SummaryChart.jsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- FUNGSI BARU UNTUK FORMAT ANGKA DI SUMBU Y ---
const formatYAxis = (tickItem) => {
    if (tickItem >= 1000000) {
        return `${(tickItem / 1000000).toFixed(1)} jt`; // Format jadi Juta
    }
    if (tickItem >= 1000) {
        return `${Math.round(tickItem / 1000)} rb`; // Format jadi Ribu
    }
    return tickItem;
};


const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const incomeData = payload.find(p => p.dataKey === 'totalPemasukan');
        const expenseData = payload.find(p => p.dataKey === 'totalPengeluaran');
        const balanceData = payload.find(p => p.dataKey === 'totalSaldo'); // <-- Ambil data saldo

        return (
            <div className="bg-gray-700 p-4 rounded-md border border-gray-600">
                <p className="label text-white font-bold">{`${label}`}</p>

                {/* Tampilkan info saldo di tooltip */}
                {balanceData && <p className="font-semibold" style={{ color: balanceData.stroke }}>
                    Total Saldo: Rp {balanceData.value.toLocaleString('id-ID')}
                </p>}
                <hr className="my-2 border-gray-500" />

                {incomeData && incomeData.payload.pemasukan > 0 && <p className="text-sm" style={{ color: incomeData.stroke }}>
                    Pemasukan hari ini: +Rp {incomeData.payload.pemasukan.toLocaleString('id-ID')}
                </p>}
                {expenseData && expenseData.payload.pengeluaran > 0 && <p className="text-sm" style={{ color: expenseData.stroke }}>
                    Pengeluaran hari ini: -Rp {expenseData.payload.pengeluaran.toLocaleString('id-ID')}
                </p>}
            </div>
        );
    }
    return null;
};

const SummaryChart = ({ data }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg" style={{ height: '400px' }}>
            <h2 className="text-2xl font-semibold mb-4">Aktivitas Keuangan Kumulatif</h2>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis dataKey="name" stroke="#A0AEC0" />

                    {/* --- GUNAKAN FORMATTER BARU DI SINI --- */}
                    <YAxis stroke="#A0AEC0" tickFormatter={formatYAxis} />

                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#E2E8F0' }} />

                    <Line type="monotone" dataKey="totalPemasukan" stroke="#48BB78" strokeWidth={2} name="Total Pemasukan" dot={false} />
                    <Line type="monotone" dataKey="totalPengeluaran" stroke="#F56565" strokeWidth={2} name="Total Pengeluaran" dot={false} />

                    {/* --- GARIS BARU UNTUK SALDO --- */}
                    <Line type="monotone" dataKey="totalSaldo" stroke="#63B3ED" strokeWidth={3} name="Total Saldo" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SummaryChart;