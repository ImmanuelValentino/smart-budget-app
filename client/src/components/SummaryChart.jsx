// src/components/SummaryChart.jsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- FUNGSI UNTUK FORMAT ANGKA DI SUMBU Y ---
const formatYAxis = (tickItem) => {
    // Format angka negatif juga
    const absTick = Math.abs(tickItem);
    const sign = tickItem < 0 ? '-' : '';
    if (absTick >= 1000000) {
        return `${sign}${(absTick / 1000000).toFixed(1)} jt`; // Format jadi Juta
    }
    if (absTick >= 1000) {
        return `${sign}${Math.round(absTick / 1000)} rb`; // Format jadi Ribu
    }
    return tickItem;
};

// --- TOOLTIP CUSTOM UNTUK MENAMPILKAN DETAIL ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Cari data untuk setiap garis berdasarkan dataKey
        const incomeData = payload.find(p => p.dataKey === 'totalPemasukan');
        const expenseData = payload.find(p => p.dataKey === 'totalPengeluaran');
        const balanceData = payload.find(p => p.dataKey === 'totalSaldo'); // Data Saldo Absolut

        // Ambil data perubahan harian dari payload pertama (semua payload punya data harian yang sama)
        // Pastikan payload[0].payload ada sebelum mengakses propertinya
        const dailyIncome = payload[0]?.payload?.pemasukanHarian ?? 0;
        const dailyExpense = payload[0]?.payload?.pengeluaranHarian ?? 0;

        return (
            <div className="bg-gray-700 p-3 rounded-md border border-gray-600 shadow-lg text-sm">
                <p className="label text-white font-bold mb-2">{`${label}`}</p>

                {/* Tampilkan Saldo Absolut */}
                {balanceData && typeof balanceData.value === 'number' && (
                    <p className="font-semibold mb-1" style={{ color: balanceData.stroke || '#63B3ED' }}>
                        Total Saldo: Rp {balanceData.value.toLocaleString('id-ID')}
                    </p>
                )}

                {/* Tampilkan Pemasukan & Pengeluaran Kumulatif */}
                {incomeData && typeof incomeData.value === 'number' && (
                    <p style={{ color: incomeData.stroke || '#48BB78' }}>
                        Tot. Pemasukan: Rp {incomeData.value.toLocaleString('id-ID')}
                    </p>
                )}
                {expenseData && typeof expenseData.value === 'number' && (
                    <p style={{ color: expenseData.stroke || '#F56565' }}>
                        Tot. Pengeluaran: Rp {expenseData.value.toLocaleString('id-ID')}
                    </p>
                )}

                {/* Tampilkan Perubahan Harian Jika Ada */}
                {(dailyIncome > 0 || dailyExpense > 0) && <hr className="my-2 border-gray-500" />}
                {dailyIncome > 0 && <p className="text-xs text-green-400">Hari ini: +Rp {dailyIncome.toLocaleString('id-ID')}</p>}
                {dailyExpense > 0 && <p className="text-xs text-red-400">Hari ini: -Rp {dailyExpense.toLocaleString('id-ID')}</p>}
            </div>
        );
    }
    return null;
};

// --- KOMPONEN UTAMA SUMMARY CHART ---
const SummaryChart = ({ data }) => {
    // Pastikan data adalah array dan memiliki elemen
    const chartData = Array.isArray(data) ? data : [];

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg" style={{ height: '400px' }}>
            <h2 className="text-2xl font-semibold mb-4 text-white">Pergerakan Keuangan Kumulatif (Periode Dipilih)</h2>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" /> {/* Warna grid */}
                        <XAxis dataKey="name" stroke="#D1D5DB" /> {/* Warna label X */}
                        <YAxis stroke="#D1D5DB" tickFormatter={formatYAxis} /> {/* Warna label Y + format */}
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#F9FAFB', paddingTop: '10px' }} /> {/* Warna legenda */}

                        {/* Garis Pemasukan Kumulatif */}
                        <Line
                            type="monotone"
                            dataKey="totalPemasukan"
                            stroke="#48BB78" // Warna hijau
                            strokeWidth={2}
                            name="Tot. Pemasukan"
                            dot={false}
                            isAnimationActive={false} // Coba matikan animasi
                        />
                        {/* Garis Pengeluaran Kumulatif */}
                        <Line
                            type="monotone"
                            dataKey="totalPengeluaran"
                            stroke="#F56565" // Warna merah
                            strokeWidth={2}
                            name="Tot. Pengeluaran"
                            dot={false}
                            isAnimationActive={false} // Coba matikan animasi
                        />
                        {/* Garis Saldo Total Absolut */}
                        <Line
                            type="monotone"
                            dataKey="totalSaldo" // Pastikan ini cocok dengan data dari dashboard/page.jsx
                            stroke="#63B3ED" // Warna biru
                            strokeWidth={3}
                            name="Total Saldo"
                            dot={false}
                            isAnimationActive={false} // Coba matikan animasi
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                // Tampilan jika tidak ada data atau data belum siap
                <div className="flex items-center justify-center h-[300px]">
                    <p className="text-gray-400">Pilih rentang tanggal atau tambahkan transaksi untuk melihat grafik.</p>
                </div>
            )}
        </div>
    );
};

export default SummaryChart;