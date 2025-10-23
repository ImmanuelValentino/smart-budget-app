'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#A28FBA', '#F76B8A', '#83A6ED']; // Tambahkan lebih banyak warna jika perlu

const ExpensePieChart = ({ data }) => {
    // Ensure data is always an array, even if empty or null
    const chartData = Array.isArray(data) ? data : [];

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-white">Pengeluaran Berdasarkan Kategori</h3>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#F9FAFB' }}
                            labelStyle={{ color: '#F9FAFB' }}
                        />
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{ color: '#F9FAFB' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-gray-400 text-center py-10">Belum ada data pengeluaran untuk ditampilkan.</p>
            )}
        </div>
    );
};

export default ExpensePieChart;