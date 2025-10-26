'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/services/api'; // Pastikan path ini benar
import Link from 'next/link';
import dynamic from 'next/dynamic'; // Import dynamic

// Gunakan dynamic import untuk chart dengan ssr: false
// Tambahkan komponen loading skeleton sederhana
const ChartLoadingSkeleton = () => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-[400px] flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Memuat grafik...</p>
    </div>
);
const SummaryChart = dynamic(() => import('@/components/SummaryChart'), { ssr: false, loading: () => <ChartLoadingSkeleton /> }); // Pastikan path ini benar
const ExpensePieChart = dynamic(() => import('@/components/ExpensePieChart'), { ssr: false, loading: () => <ChartLoadingSkeleton /> }); // Pastikan path ini benar


const DashboardPage = () => {
    // State untuk filter tanggal
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1); // Set ke tanggal 1 bulan ini
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // Set ke hari ini

    // State untuk data
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [lineChartData, setLineChartData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);
    const [isClient, setIsClient] = useState(false); // State untuk menandai render di client

    // Fungsi untuk mengambil data, dibuat dengan useCallback
    const fetchData = useCallback(async () => {
        try {
            // Ambil SEMUA akun (untuk saldo total) dan transaksi TERFILTER
            const [accRes, transRes] = await Promise.all([
                api.get('/accounts'),
                api.get('/transactions', { params: { startDate, endDate } }) // Kirim filter tanggal
            ]);

            const fetchedAccounts = accRes.data;
            const filteredTransactions = transRes.data;

            setAccounts(fetchedAccounts);
            setTransactions(filteredTransactions);

            // Hitung total saldo aktual dari semua akun
            const totalBalance = fetchedAccounts.reduce((acc, account) => acc + account.balance, 0);

            // Hitung summary pemasukan/pengeluaran HANYA dari transaksi terfilter
            calculateSummary(filteredTransactions, totalBalance);

            // Kirim SEMUA akun ke processLineChartData untuk menghitung saldo awal
            processLineChartData(filteredTransactions, fetchedAccounts);
            processPieChartData(filteredTransactions);

        } catch (error) {
            console.error("Gagal mengambil data", error);
            // Anda bisa tambahkan penanganan error di sini, misalnya logout jika token tidak valid (401)
            if (error.response && error.response.status === 401) {
                // Contoh: Redirect ke login jika token tidak valid
                // localStorage.removeItem('userInfo');
                // router.push('/login'); // Anda perlu import useRouter jika ingin redirect
                alert("Sesi Anda habis, silakan login kembali.");
            } else {
                alert("Gagal memuat data dashboard.");
            }
        }
    }, [startDate, endDate]); // Dependensi fetchData adalah startDate dan endDate

    useEffect(() => {
        setIsClient(true); // Komponen sudah di sisi client
        fetchData(); // Panggil fetchData di useEffect
    }, [fetchData]); // useEffect sekarang bergantung pada fetchData

    // Fungsi untuk menghitung ringkasan (kartu)
    const calculateSummary = (filteredTransactions, totalBalance) => {
        const income = filteredTransactions.filter(t => t.type === 'pemasukan').reduce((acc, t) => acc + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'pengeluaran').reduce((acc, t) => acc + t.amount, 0);
        // Gunakan totalBalance yang sudah dihitung
        setSummary({ income, expense, balance: totalBalance });
    };

    // Fungsi untuk mengolah data Line Chart (Saldo Absolut Kumulatif)
    const processLineChartData = (filteredTransactions, allAccounts) => {
        // 1. Hitung Saldo Awal (Saldo Total Saat Ini - Perubahan Selama Periode Filter)
        const currentTotalBalance = allAccounts.reduce((acc, account) => acc + account.balance, 0);
        let netChangeDuringPeriod = 0;
        filteredTransactions.forEach(t => {
            netChangeDuringPeriod += (t.type === 'pemasukan' ? t.amount : -t.amount);
        });
        const startingBalance = currentTotalBalance - netChangeDuringPeriod;

        // 2. Kelompokkan perubahan harian dari transaksi terfilter
        const dailyChanges = filteredTransactions.reduce((acc, t) => {
            const transactionDate = new Date(t.date);
            if (isNaN(transactionDate.getTime())) return acc; // Lewati tanggal tidak valid
            const dateKey = transactionDate.toISOString().split('T')[0];

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    name: transactionDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
                    dateObject: transactionDate,
                    pemasukanHarian: 0,
                    pengeluaranHarian: 0
                };
            }
            if (t.type === 'pemasukan') {
                acc[dateKey].pemasukanHarian += t.amount;
            } else {
                acc[dateKey].pengeluaranHarian += t.amount;
            }
            return acc;
        }, {});

        // 3. Urutkan hari
        const sortedDays = Object.values(dailyChanges).sort((a, b) => a.dateObject - b.dateObject);

        // 4. Hitung Saldo Absolut dan Pemasukan/Pengeluaran Kumulatif
        let cumulativeIncome = 0;
        let cumulativeExpense = 0;
        let currentBalance = startingBalance;
        const cumulativeData = sortedDays.map(day => {
            cumulativeIncome += day.pemasukanHarian;
            cumulativeExpense += day.pengeluaranHarian;
            currentBalance += (day.pemasukanHarian - day.pengeluaranHarian);

            return {
                name: day.name,
                pemasukanHarian: Number(day.pemasukanHarian),
                pengeluaranHarian: Number(day.pengeluaranHarian),
                totalPemasukan: Number(cumulativeIncome),
                totalPengeluaran: Number(cumulativeExpense),
                totalSaldo: Number(currentBalance), // Ini adalah saldo absolut
            };
        });

        console.log("Data untuk Line Chart (Lengkap):", cumulativeData);
        setLineChartData(cumulativeData);
    };

    // Fungsi untuk mengolah data Pie Chart (tidak berubah)
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

    // Komponen Kartu Ringkasan (tidak berubah)
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
            {/* Header dan Filter Tanggal */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold">Ringkasan Keuangan</h1>
                <div className="flex items-center space-x-2 md:space-x-4">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                </div>
            </div>

            {/* Kartu Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title={`Pemasukan (${new Date(startDate).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })} - ${new Date(endDate).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })})`} amount={summary.income} color="text-green-400" linkTo="/dashboard/income" />
                <SummaryCard title={`Pengeluaran (${new Date(startDate).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })} - ${new Date(endDate).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })})`} amount={summary.expense} color="text-red-400" linkTo="/dashboard/expenses" />
                <SummaryCard title="Total Saldo (Semua Akun)" amount={summary.balance} color="text-white" linkTo="/dashboard/accounts" />
            </div>

            {/* Line Chart Kumulatif - Render Kondisional */}
            <div>
                {/* Pastikan komponen SummaryChart hanya menampilkan garis totalSaldo */}
                {isClient ? <SummaryChart data={lineChartData} /> : <ChartLoadingSkeleton />}
            </div>

            {/* Pie Chart dan Transaksi Terakhir - Render Kondisional */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {isClient ? <ExpensePieChart data={pieChartData} /> : <ChartLoadingSkeleton />}

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Transaksi Terakhir (dalam rentang)</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {transactions.length > 0 ? (
                            transactions.map((trans) => (
                                <div key={trans._id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                                    <div>
                                        <p className="font-bold">{trans.category}</p>
                                        <p className="text-sm text-gray-400">{new Date(trans.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
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