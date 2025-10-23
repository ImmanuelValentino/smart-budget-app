'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';

const AccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountBalance, setNewAccountBalance] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editAccountId, setEditAccountId] = useState(null);
    const [editAccountName, setEditAccountName] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/accounts');
            setAccounts(res.data);
        } catch (err) {
            console.error('Error fetching accounts:', err);
            setError('Gagal memuat akun. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAccount = async (e) => {
        e.preventDefault();
        if (!newAccountName) return alert('Nama akun tidak boleh kosong.');
        try {
            setIsAdding(true);
            await api.post('/accounts', {
                name: newAccountName,
                balance: parseFloat(newAccountBalance) || 0,
            });
            setNewAccountName('');
            setNewAccountBalance('');
            await fetchAccounts();
        } catch (err) {
            const message = err.response ? err.response.data.message : err.message;
            alert(`Gagal menambah akun: ${message}`);
            console.error('Error adding account:', err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteAccount = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus akun ini? Akun yang memiliki transaksi tidak bisa dihapus.')) return;
        try {
            await api.delete(`/accounts/${id}`);
            await fetchAccounts();
        } catch (err) {
            const message = err.response ? err.response.data.message : err.message;
            alert(`Gagal menghapus akun: ${message}`);
            console.error('Error deleting account:', err);
        }
    };

    const handleEditClick = (account) => {
        setEditAccountId(account._id);
        setEditAccountName(account.name);
    };

    const handleUpdateAccount = async (id) => {
        try {
            if (!editAccountName) return alert('Nama akun tidak boleh kosong.');
            await api.put(`/accounts/${id}`, { name: editAccountName });
            setEditAccountId(null);
            setEditAccountName('');
            await fetchAccounts();
        } catch (err) {
            const message = err.response ? err.response.data.message : err.message;
            alert(`Gagal memperbarui akun: ${message}`);
            console.error('Error updating account:', err);
        }
    };

    if (loading) return <div className="text-center py-10 text-lg text-gray-400">Memuat akun...</div>;
    if (error) return <div className="text-center py-10 text-red-500 text-lg">{error}</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-green-400 mb-6">Kelola Akun Anda</h1>

            {/* Form Tambah Akun */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-white">Tambah Akun Baru</h2>
                <form onSubmit={handleAddAccount} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="newAccountName" className="block text-sm font-medium text-gray-300 mb-1">Nama Akun</label>
                        <input
                            type="text"
                            id="newAccountName"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            placeholder="Misal: Tabungan, Tunai, Bank XYZ"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="newAccountBalance" className="block text-sm font-medium text-gray-300 mb-1">Saldo Awal (Opsional)</label>
                        <input
                            type="number"
                            id="newAccountBalance"
                            value={newAccountBalance}
                            onChange={(e) => setNewAccountBalance(e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                    >
                        {isAdding ? 'Menambah...' : 'Tambah Akun'}
                    </button>
                </form>
            </div>

            {/* Daftar Akun */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-white">Daftar Akun</h2>
                {accounts.length === 0 ? (
                    <p className="text-gray-400">Belum ada akun yang dibuat. Silakan tambahkan satu!</p>
                ) : (
                    <ul className="space-y-4">
                        {accounts.map((account) => (
                            <li key={account._id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-700 p-4 rounded-md shadow-sm">
                                {editAccountId === account._id ? (
                                    <div className="flex-grow flex items-center space-x-2 w-full md:w-auto">
                                        <input
                                            type="text"
                                            value={editAccountName}
                                            onChange={(e) => setEditAccountName(e.target.value)}
                                            className="flex-grow px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={() => handleUpdateAccount(account._id)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                                        >
                                            Simpan
                                        </button>
                                        <button
                                            onClick={() => setEditAccountId(null)}
                                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-grow mb-2 md:mb-0">
                                            <p className="text-lg font-medium text-white">{account.name}</p>
                                            <p className="text-sm text-gray-300">Saldo: <span className="font-semibold text-green-400">Rp {account.balance.toLocaleString('id-ID')}</span></p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditClick(account)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                                            >
                                                Edit Nama
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAccount(account._id)}
                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AccountsPage;