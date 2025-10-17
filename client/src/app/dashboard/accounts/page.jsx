'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';

const AccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [form, setForm] = useState({ name: '', balance: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const { data } = await api.get('/accounts');
            setAccounts(data);
        } catch (error) {
            console.error("Gagal mengambil data akun", error);
        }
    };

    const formatRupiah = (angka) => {
        if (!angka) return '';
        return new Intl.NumberFormat('id-ID').format(angka);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'balance') {
            const rawValue = value.replace(/[^0-9]/g, '');
            setForm({ ...form, [name]: rawValue });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/accounts/${editingId}`, { name: form.name });
                alert('Akun berhasil diperbarui!');
            } else {
                await api.post('/accounts', { ...form, balance: Number(form.balance) });
                alert('Akun baru berhasil ditambahkan!');
            }
            fetchAccounts();
            resetForm();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal memproses akun');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin? Menghapus akun hanya bisa dilakukan jika tidak ada transaksi terkait.')) {
            try {
                const { data } = await api.delete(`/accounts/${id}`);
                alert(data.message);
                fetchAccounts();
            } catch (error) {
                alert(error.response?.data?.message || 'Gagal menghapus akun');
            }
        }
    };

    const handleEditClick = (account) => {
        setEditingId(account._id);
        setForm({ name: account.name, balance: account.balance });
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ name: '', balance: '' });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Kelola Akun Anda</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">{editingId ? 'Edit Nama Akun' : 'Tambah Akun Baru'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">Nama Akun</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Contoh: Dompet Tunai" className="w-full px-4 py-2 text-white bg-gray-700 rounded-md border border-gray-600" />
                        </div>
                        {!editingId && (
                            <div>
                                <label className="block mb-2 text-sm text-gray-300">Saldo Awal (Rp)</label>
                                <input type="text" inputMode="numeric" name="balance" value={formatRupiah(form.balance)} onChange={handleChange} required placeholder="500.000" className="w-full px-4 py-2 text-white bg-gray-700 rounded-md border border-gray-600" />
                            </div>
                        )}
                        <button type="submit" className="w-full py-2 font-bold text-gray-900 bg-green-400 rounded-md hover:bg-green-500">
                            {editingId ? 'Update Akun' : 'Simpan Akun'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="w-full mt-2 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Batal</button>
                        )}
                    </form>
                </div>
                <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Daftar Akun</h2>
                    <div className="space-y-3">
                        {accounts.map((account) => (
                            <div key={account._id} className="flex justify-between items-center bg-gray-700 p-4 rounded">
                                <p className="font-bold text-lg">{account.name}</p>
                                <div className="flex items-center gap-4">
                                    <p className="font-semibold text-white">Rp {account.balance.toLocaleString('id-ID')}</p>
                                    <button onClick={() => handleEditClick(account)} className="text-yellow-400 text-sm hover:text-yellow-300">Edit</button>
                                    <button onClick={() => handleDelete(account._id)} className="text-red-500 text-sm hover:text-red-400">Hapus</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountsPage;