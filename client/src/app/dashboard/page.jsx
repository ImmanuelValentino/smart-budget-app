'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api'; // <-- 1. Ganti import axios dengan service api
import SummaryChart from '@/components/SummaryChart';
import ExpensePieChart from '@/components/ExpensePieChart';
import Link from 'next/link';

const DashboardPage = () => {
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [lineChartData, setLineChartData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);

    useEffect(() => {
        fetchData(); // <-- 2. Panggil fetchData tanpa perlu mengirim token
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            // 3. Gunakan 'api' dan hapus URL lengkap serta config header
            const [transRes, accRes] = await Promise.all([
                api.get('/transactions', { params: { startDate, endDate } }),
                api.get('/accounts')
            ]);

            setTransactions(transRes.data);
            setAccounts(accRes.data);

            calculateSummary(transRes.data, accRes.data);
            processLineChartData(transRes.data);
            processPieChartData(transRes.data);
        } catch (error) {
            console.error("Gagal mengambil data", error);
            // Anda bisa tambahkan logika logout jika errornya karena token tidak valid (401)
        }
    };

    const calculateSummary = (transactionsData, accountsData) => {
        const income = transactionsData
            .filter(t => t.type === 'pemasukan')
            .reduce((acc, t) => acc + t.amount, 0);
        const expense = transactionsData
            .filter(t => t.type === 'pengeluaran')
            .reduce((acc, t) => acc + t.amount, 0);
        const totalBalance = accountsData.reduce((acc, account) => acc + account.balance, 0);
        setSummary({ income, expense, balance: totalBalance });
    };

    const processLineChartData = (transactionsData) => {
        const dailyTotals = transactionsData.reduce((acc, t) => {
            const date = new Date(t.date).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { name: new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }), date: new Date(t.date), pemasukan: 0, pengeluaran: 0 };
            }
            if (t.type === 'pemasukan') {
                acc[date].pemasukan += t.amount;
            } else {
                acc[date].pengeluaran += t.amount;
            }
            return acc;
        }, {});
        const sortedDays = Object.values(dailyTotals).sort((a, b) => a.date - b.date);
        let cumulativeIncome = 0;
        let cumulativeExpense = 0;
        const cumulativeData = sortedDays.map(day => {
            cumulativeIncome += day.pemasukan;
            cumulativeExpense += day.pengeluaran;
            const cumulativeBalance = cumulativeIncome - cumulativeExpense;
            return { ...day, totalPemasukan: cumulativeIncome, totalPengeluaran: cumulativeExpense, totalSaldo: cumulativeBalance };
        });
        setLineChartData(cumulativeData);
    };

    const processPieChartData = (transactionsData) => {
        const expenseData = transactionsData
            .filter(t => t.type === 'pengeluaran')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});
        const formattedPieData = Object.keys(expenseData).map(key => ({ name: key, value: expenseData[key] }));
        setPieChartData(formattedPieData);
    };

    const SummaryCard = ({ title, amount, color, linkTo }) => (
        <Link href={linkTo}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <h3 className="text-gray-400 text-sm font-medium uppercase">{title}</h3>
                <p className={`text-3xl font-bold mt-2 ${color}`}>Rp {amount.toLocaleString('id-ID')}</p>
            </div>
        </Link>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold">Ringkasan Keuangan</h1>
                <div className="flex items-center space-x-2 md:space-x-4">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title={`Pemasukan (${new Date(startDate).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })} - ${new Date(endDate).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })})`} amount={summary.income} color="text-green-400" linkTo="/dashboard/income" />
                <SummaryCard title={`Pengeluaran (${new Date(startDate).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })} - ${new Date(endDate).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })})`} amount={summary.expense} color="text-red-400" linkTo="/dashboard/expenses" />
                <SummaryCard title="Total Saldo Saat Ini" amount={summary.balance} color="text-white" linkTo="/dashboard/accounts" />
            </div>

            <div>
                <SummaryChart data={lineChartData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ExpensePieChart data={pieChartData} />
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Transaksi Terakhir (dalam rentang)</h2>
                    <div className="space-y-3">
                        {transactions.length > 0 ? (
                            transactions.map((trans) => (
                                <div key={trans._id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                                    <div>
                                        <p className="font-bold">{trans.category}</p>
                                        <p className="text-sm text-gray-400">{new Date(trans.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                                    </div>
                                    <p className={`font-bold ${trans.type === 'pemasukan' ? 'text-green-400' : 'text-red-400'}`}>
                                        {trans.type === 'pemasukan' ? '+' : '-'} Rp {trans.amount.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">Tidak ada transaksi pada rentang tanggal ini.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;