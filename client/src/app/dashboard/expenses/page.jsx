'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import ClientCreatableSelect from '@/components/ClientCreatableSelect';

const ExpensesPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        accountId: '',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editTransactionId, setEditTransactionId] = useState(null);
    const [filterDateRange, setFilterDateRange] = useState('30_days'); // '7_days', '30_days', 'all_time'

    useEffect(() => {
        fetchData();
    }, [filterDateRange]); // Refetch when filterDateRange changes

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch accounts
            const accountsRes = await api.get('/accounts');
            setAccounts(accountsRes.data);
            if (accountsRes.data.length > 0 && !formData.accountId) {
                setFormData((prev) => ({ ...prev, accountId: accountsRes.data[0]._id }));
            }

            // Fetch categories
            const categoriesRes = await api.get('/categories');
            setCategories(categoriesRes.data.pengeluaran); // Only expense categories

            // Determine date filter for transactions
            let startDate = null;
            let endDate = new Date(); // Today
            if (filterDateRange === '7_days') {
                startDate = new Date();
                startDate.setDate(endDate.getDate() - 7);
            } else if (filterDateRange === '30_days') {
                startDate = new Date();
                startDate.setDate(endDate.getDate() - 30);
            } // 'all_time' means startDate is null

            const formatDate = (date) => date.toISOString().split('T')[0];
            const params = {};
            if (startDate) params.startDate = formatDate(startDate);
            if (endDate) params.endDate = formatDate(endDate);

            const transactionsRes = await api.get('/transactions', { params });
            // Filter only expenses for this page
            setTransactions(transactionsRes.data.filter(t => t.type === 'pengeluaran'));
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Gagal memuat data. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (selectedOption) => {
        setFormData((prev) => ({ ...prev, category: selectedOption ? selectedOption.value : '' }));
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!formData.accountId || !formData.category || !formData.amount || !formData.date) {
            return alert('Mohon lengkapi semua kolom.');
        }
        try {
            setIsAdding(true);
            await api.post('/transactions', { ...formData, type: 'pengeluaran', amount: parseFloat(formData.amount) });
            setFormData({
                accountId: accounts.length > 0 ? accounts[0]._id : '',
                category: '',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
            });
            await fetchData();
        } catch (err) {
            const message = err.response ? err.response.data.message : err.message;
            alert(`Gagal menambah pengeluaran: ${message}`);
            console.error('Error adding expense:', err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            await fetchData();
        } catch (err) {
            const message = err.response ? err.response.data.message : err.message;
            alert(`Gagal menghapus transaksi: ${message}`);
            console.error('Error deleting transaction:', err);
        }
    };

    const handleEditClick = (transaction) => {
        setEditTransactionId(transaction._id);
        setFormData({
            accountId: transaction.account,
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description,
            date: new Date(transaction.date).toISOString().split('T')[0],
        });
    };

    const handleUpdateTransaction = async (id) => {
        if (!formData.accountId || !formData.category || !formData.amount || !formData.date) {
            return alert('Mohon lengkapi semua kolom.');
        }
        try {
            await api.put(`/transactions/${id}`, { ...formData, type: 'pengeluaran', amount: parseFloat(formData.amount) });
            setEditTransactionId(null);
            setFormData({
                accountId: accounts.length > 0 ? accounts[0]._id : '',
                category: '',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
            });
            await fetchData();
        } catch (err) {
            const message = err.response ? err.response.data.message : err.message;
            alert(`Gagal memperbarui pengeluaran: ${message}`);
            console.error('Error updating expense:', err);
        }
    };

    if (loading) return <div className="text-center py-10 text-lg text-gray-400">Memuat pengeluaran...</div>;
    if (error) return <div className="text-center py-10 text-red-500 text-lg">{error}</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-red-400 mb-6">Kelola Pengeluaran</h1>

            {/* Form Tambah/Edit Transaksi */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-white">
                    {editTransactionId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}
                </h2>
                <form onSubmit={editTransactionId ? (e) => { e.preventDefault(); handleUpdateTransaction(editTransactionId); } : handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="accountId" className="block text-sm font-medium text-gray-300 mb-1">Akun</label>
                        <select
                            id="accountId"
                            name="accountId"
                            value={formData.accountId}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        >
                            <option value="">Pilih Akun</option>
                            {accounts.map((account) => (
                                <option key={account._id} value={account._id}>{account.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                        <ClientCreatableSelect
                            id="category"
                            name="category"
                            options={categories.map(cat => ({ value: cat, label: cat }))}
                            value={formData.category ? { value: formData.category, label: formData.category } : null}
                            onChange={handleCategoryChange}
                            placeholder="Pilih atau Buat Kategori"
                            className="w-full"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Jumlah</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="100000"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Tanggal</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Deskripsi (Opsional)</label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Makan siang di cafe"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div className="md:col-span-full">
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                        >
                            {isAdding ? 'Menyimpan...' : (editTransactionId ? 'Perbarui Pengeluaran' : 'Tambah Pengeluaran')}
                        </button>
                        {editTransactionId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditTransactionId(null);
                                    setFormData({
                                        accountId: accounts.length > 0 ? accounts[0]._id : '',
                                        category: '',
                                        amount: '',
                                        description: '',
                                        date: new Date().toISOString().split('T')[0],
                                    });
                                }}
                                className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                            >
                                Batal Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Filter Tanggal */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex justify-end">
                <label htmlFor="filterDateRange" className="block text-sm font-medium text-gray-300 mr-2 self-center">Tampilkan:</label>
                <select
                    id="filterDateRange"
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="7_days">7 Hari Terakhir</option>
                    <option value="30_days">30 Hari Terakhir</option>
                    <option value="all_time">Semua Waktu</option>
                </select>
            </div>

            {/* Daftar Transaksi */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-white">Daftar Pengeluaran</h2>
                {transactions.length === 0 ? (
                    <p className="text-gray-400">Belum ada pengeluaran untuk periode ini.</p>
                ) : (
                    <ul className="space-y-4">
                        {transactions.map((transaction) => (
                            <li key={transaction._id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-700 p-4 rounded-md shadow-sm">
                                <div className="flex-grow mb-2 md:mb-0">
                                    <p className="text-lg font-medium text-white">Rp {transaction.amount.toLocaleString('id-ID')} - {transaction.category}</p>
                                    <p className="text-sm text-gray-300">
                                        {new Date(transaction.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} dari {accounts.find(acc => acc._id === transaction.account)?.name || 'N/A'}
                                    </p>
                                    {transaction.description && (
                                        <p className="text-xs text-gray-400 italic">{transaction.description}</p>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditClick(transaction)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTransaction(transaction._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ExpensesPage;