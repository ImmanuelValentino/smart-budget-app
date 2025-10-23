'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';

const BudgetsPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newBudget, setNewBudget] = useState({
        name: '',
        amount: '',
        startDate: '',
        endDate: '',
    });
    const [isAdding, setIsAdding] = useState(false);
    const [editBudgetId, setEditBudgetId] = useState(null);
    const [editBudgetFormData, setEditBudgetFormData] = useState({
        name: '',
        amount: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/budgets');
            setBudgets(res.data);
        } catch (err) {
            console.error('Error fetching budgets:', err);
            setError('Gagal memuat anggaran. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBudget((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddBudget = async (e) => {
        e.preventDefault();
        if (!newBudget.name || !newBudget.amount || !newBudget.startDate || !newBudget.endDate) {
            return alert('Mohon lengkapi semua kolom.');
        }
        try {
            setIsAdding(true);
            await api.post('/budgets', newBudget);
            setNewBudget({ name: '', amount: '', startDate: '', endDate: '' });
            await fetchBudgets();
        } catch (err) {
            const message = err.response ? err.response.data.message : err.message;
            alert(`Gagal menambah anggaran: ${message}`);
            console.error('Error adding budget:', err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteBudget = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus anggaran ini?')) return;
        try {
            await api.delete(`/budgets/${id}`);
            await fetchBudgets();
        } catch (err) {
            const message = err.response ? err.response.data.message : err.message;
            alert(`Gagal menghapus anggaran: ${message}`);
            console.error('Error deleting budget:', err);
        }
    };

    const handleEditClick = (budget) => {
        setEditBudgetId(budget._id);
        setEditBudgetFormData({
            name: budget.name,
            amount: budget.amount,
            startDate: new Date(budget.startDate).toISOString().split('T')[0],
            endDate: new Date(budget.endDate).toISOString().split('T')[0],
        });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditBudgetFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateBudget = async (id) => {
        if (!editBudgetFormData.name || !editBudgetFormData.amount || !editBudgetFormData.startDate || !editBudgetFormData.endDate) {
            return alert('Mohon lengkapi semua kolom.');
        }
        try {
            await api.put(`/budgets/${id}`, editBudgetFormData);
            setEditBudgetId(null);
            setEditBudgetFormData({ name: '', amount: '', startDate: '', endDate: '' });
            await fetchBudgets();
        } catch (err) {
            const message = err.response ? err.response.data.message : err.message;
            alert(`Gagal memperbarui anggaran: ${message}`);
            console.error('Error updating budget:', err);
        }
    };

    if (loading) return <div className="text-center py-10 text-lg text-gray-400">Memuat anggaran...</div>;
    if (error) return <div className="text-center py-10 text-red-500 text-lg">{error}</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-green-400 mb-6">Kelola Anggaran</h1>

            {/* Form Tambah Anggaran */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-white">Buat Anggaran Baru</h2>
                <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label htmlFor="budgetName" className="block text-sm font-medium text-gray-300 mb-1">Nama Anggaran</label>
                        <input
                            type="text"
                            id="budgetName"
                            name="name"
                            value={newBudget.name}
                            onChange={handleInputChange}
                            placeholder="Misal: Bulanan Makanan"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="budgetAmount" className="block text-sm font-medium text-gray-300 mb-1">Jumlah</label>
                        <input
                            type="number"
                            id="budgetAmount"
                            name="amount"
                            value={newBudget.amount}
                            onChange={handleInputChange}
                            placeholder="500000"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="budgetStartDate" className="block text-sm font-medium text-gray-300 mb-1">Dari Tanggal</label>
                        <input
                            type="date"
                            id="budgetStartDate"
                            name="startDate"
                            value={newBudget.startDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="budgetEndDate" className="block text-sm font-medium text-gray-300 mb-1">Sampai Tanggal</label>
                        <input
                            type="date"
                            id="budgetEndDate"
                            name="endDate"
                            value={newBudget.endDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                    >
                        {isAdding ? 'Membuat...' : 'Buat Anggaran'}
                    </button>
                </form>
            </div>

            {/* Daftar Anggaran */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-white">Daftar Anggaran</h2>
                {budgets.length === 0 ? (
                    <p className="text-gray-400">Belum ada anggaran yang dibuat. Silakan tambahkan satu!</p>
                ) : (
                    <ul className="space-y-4">
                        {budgets.map((budget) => (
                            <li key={budget._id} className="bg-gray-700 p-4 rounded-md shadow-sm">
                                {editBudgetId === budget._id ? (
                                    <form onSubmit={(e) => { e.preventDefault(); handleUpdateBudget(budget._id); }} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                        <div>
                                            <label htmlFor="editBudgetName" className="block text-sm font-medium text-gray-300 mb-1">Nama</label>
                                            <input
                                                type="text"
                                                id="editBudgetName"
                                                name="name"
                                                value={editBudgetFormData.name}
                                                onChange={handleEditInputChange}
                                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="editBudgetAmount" className="block text-sm font-medium text-gray-300 mb-1">Jumlah</label>
                                            <input
                                                type="number"
                                                id="editBudgetAmount"
                                                name="amount"
                                                value={editBudgetFormData.amount}
                                                onChange={handleEditInputChange}
                                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="editBudgetStartDate" className="block text-sm font-medium text-gray-300 mb-1">Dari</label>
                                            <input
                                                type="date"
                                                id="editBudgetStartDate"
                                                name="startDate"
                                                value={editBudgetFormData.startDate}
                                                onChange={handleEditInputChange}
                                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="editBudgetEndDate" className="block text-sm font-medium text-gray-300 mb-1">Sampai</label>
                                            <input
                                                type="date"
                                                id="editBudgetEndDate"
                                                name="endDate"
                                                value={editBudgetFormData.endDate}
                                                onChange={handleEditInputChange}
                                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                                                required
                                            />
                                        </div>
                                        <div className="flex space-x-2">
                                            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors">Simpan</button>
                                            <button type="button" onClick={() => setEditBudgetId(null)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors">Batal</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <div className="flex-grow mb-2 md:mb-0">
                                            <p className="text-lg font-medium text-white">{budget.name} (Rp {budget.amount.toLocaleString('id-ID')})</p>
                                            <p className="text-sm text-gray-300">
                                                {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                Terpakai: <span className="font-semibold text-red-400">Rp {budget.spent.toLocaleString('id-ID')}</span>,
                                                Sisa: <span className="font-semibold text-green-400">Rp {budget.remaining.toLocaleString('id-ID')}</span>
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditClick(budget)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBudget(budget._id)}
                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default BudgetsPage;