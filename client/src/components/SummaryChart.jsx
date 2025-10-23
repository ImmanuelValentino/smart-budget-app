'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Fungsi format angka di sumbu Y (tidak berubah)
const formatYAxis = (tickItem) => {
    const absTick = Math.abs(tickItem);
    const sign = tickItem < 0 ? '-' : '';
    if (absTick >= 1000000) {
        return `${sign}${(absTick / 1000000).toFixed(1)} jt`;
    }
    if (absTick >= 1000) {
        return `${sign}${Math.round(absTick / 1000)} rb`;
    }
    return tickItem;
};

// Tooltip custom sekarang menampilkan Saldo Absolut dan perubahan harian
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const incomeData = payload.find(p => p.dataKey === 'totalPemasukan');
        const expenseData = payload.find(p => p.dataKey === 'totalPengeluaran');
        const balanceData = payload.find(p => p.dataKey === 'totalSaldo'); // Data Saldo Absolut
        const dailyIncome = payload[0]?.payload?.pemasukanHarian || 0;
        const dailyExpense = payload[0]?.payload?.pengeluaranHarian || 0;

        return (
            <div className="bg-gray-700 p-3 rounded-md border border-gray-600 shadow-lg text-sm">
                <p className="label text-white font-bold mb-2">{`${label}`}</p>

                {/* Tampilkan Saldo Absolut */}
                {balanceData && <p className="font-semibold mb-1" style={{ color: balanceData.stroke }}>
                    Total Saldo: Rp {balanceData.value.toLocaleString('id-ID')}
                </p>}

                {/* Tampilkan Pemasukan & Pengeluaran Kumulatif */}
                {incomeData && <p style={{ color: incomeData.stroke }}>
                    Tot. Pemasukan: Rp {incomeData.value.toLocaleString('id-ID')}
                </p>}
                {expenseData && <p style={{ color: expenseData.stroke }}>
                    Tot. Pengeluaran: Rp {expenseData.value.toLocaleString('id-ID')}
                </p>}

                {/* Tampilkan Perubahan Harian Jika Ada */}
                {(dailyIncome > 0 || dailyExpense > 0) && <hr className="my-2 border-gray-500" />}
                {dailyIncome > 0 && <p className="text-xs text-green-400">Hari ini: +Rp {dailyIncome.toLocaleString('id-ID')}</p>}
                {dailyExpense > 0 && <p className="text-xs text-red-400">Hari ini: -Rp {dailyExpense.toLocaleString('id-ID')}</p>}
            </div>
        );
    }
    return null;
};

// KOMPONEN UTAMA SUMMARY CHART
const SummaryChart = ({ data }) => {
    const chartData = Array.isArray(data) ? data : [];

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg" style={{ height: '400px' }}>
            <h2 className="text-2xl font-semibold mb-4 text-white">Pergerakan Keuangan Kumulatif (Periode Dipilih)</h2>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis dataKey="name" stroke="#D1D5DB" />
                        <YAxis stroke="#D1D5DB" tickFormatter={formatYAxis} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#F9FAFB', paddingTop: '10px' }} />

                        {/* Garis Pemasukan Kumulatif */}
                        <Line type="monotone" dataKey="totalPemasukan" stroke="#48BB78" strokeWidth={2} name="Tot. Pemasukan" dot={false} />

                        {/* Garis Pengeluaran Kumulatif */}
                        <Line type="monotone" dataKey="totalPengeluaran" stroke="#F56565" strokeWidth={2} name="Tot. Pengeluaran" dot={false} />

                        {/* Garis Saldo Total Absolut */}
                        <Line type="monotone" dataKey="totalSaldo" stroke="#63B3ED" strokeWidth={3} name="Total Saldo" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-[300px]">
                    <p className="text-gray-400">Data tidak cukup untuk grafik.</p>
                </div>
            )}
        </div>
    );
};

export default SummaryChart;