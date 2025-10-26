// src/components/ExpensePieChart.jsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Warna-warni
const COLORS = ['#F56565', '#ED8936', '#ECC94B', '#48BB78', '#38B2AC', '#4299E1', '#667EEA'];

// --- FUNGSI BARU UNTUK CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload; // Ambil data dari payload
        const total = payload[0].payload.totalExpenseValue; // Ambil total dari data (akan kita tambahkan)
        const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

        return (
            <div className="bg-gray-700 p-3 rounded-md border border-gray-600 shadow-lg text-sm">
                <p className="label text-white font-bold">{`${data.name}`}</p>
                <p style={{ color: payload[0].color }}>
                    Jumlah: Rp {data.value.toLocaleString('id-ID')}
                </p>
                <p className="text-gray-300">Persentase: {percentage}%</p>
            </div>
        );
    }
    return null;
};

// --- FUNGSI BARU UNTUK CUSTOM LEGEND ---
const renderLegend = (props) => {
    const { payload } = props;
    const totalValue = payload.reduce((sum, entry) => sum + entry.payload.value, 0); // Hitung total

    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0', textAlign: 'center' }}>
            {payload.map((entry, index) => (
                <li key={`item-${index}`} style={{ color: entry.color, display: 'inline-block', marginRight: '15px', fontSize: '12px' }}>
                    <span style={{ marginRight: '5px' }}>●</span>
                    {entry.value}: Rp {entry.payload.value.toLocaleString('id-ID')}
                    {totalValue > 0 && ` (${((entry.payload.value / totalValue) * 100).toFixed(1)}%)`} {/* Tampilkan persentase */}
                </li>
            ))}
        </ul>
    );
};


const ExpensePieChart = ({ data }) => {
    // Pastikan data adalah array
    const chartData = Array.isArray(data) ? data : [];
    // Hitung total nilai untuk persentase di tooltip
    const totalExpenseValue = chartData.reduce((sum, entry) => sum + entry.value, 0);
    // Tambahkan total ke setiap item data agar bisa diakses tooltip
    const dataWithTotal = chartData.map(entry => ({ ...entry, totalExpenseValue }));


    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg" style={{ height: '400px' }}>
            <h2 className="text-2xl font-semibold mb-4 text-white">Pengeluaran per Kategori</h2>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                        <Pie
                            data={dataWithTotal} // Gunakan data yang sudah ditambah total
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={110} // Sedikit lebih kecil agar legenda muat
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {dataWithTotal.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        {/* Gunakan Tooltip dan Legend custom */}
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-[300px]">
                    <p className="text-gray-400">Belum ada data pengeluaran untuk ditampilkan.</p>
                </div>
            )}
        </div>
    );
};

export default ExpensePieChart;