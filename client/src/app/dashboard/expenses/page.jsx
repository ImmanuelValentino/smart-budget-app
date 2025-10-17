'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import dynamic from 'next/dynamic';

const ClientCreatableSelect = dynamic(() => import('@/components/ClientCreatableSelect'), { ssr: false });

const ExpensesPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [form, setForm] = useState({
        amount: '',
        category: null,
        description: '',
        accountId: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [editingId, setEditingId] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [transRes, accRes, catRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/accounts'),
                api.get('/categories')
            ]);

            setTransactions(transRes.data.filter(t => t.type === 'pengeluaran'));
            setAccounts(accRes.data);
            setCategoryOptions(catRes.data.pengeluaran.map(cat => ({ value: cat, label: cat })));

            if (accRes.data.length > 0 && !form.accountId) {
                setForm(prev => ({ ...prev, accountId: accRes.data[0]._id }));
            }
        } catch (error) {
            console.error("Gagal mengambil data", error);
        }
    };

    const handleCreateCategory = async (inputValue) => { /* ... (fungsi ini tidak berubah) ... */ };

    const formatRupiah = (angka) => {
        if (!angka) return '';
        return new Intl.NumberFormat('id-ID').format(angka);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            const rawValue = value.replace(/[^0-9]/g, '');
            setForm({ ...form, [name]: rawValue });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.category) {
            alert('Kategori tidak boleh kosong');
            return;
        }

        const payload = {
            accountId: form.accountId,
            amount: Number(form.amount),
            category: form.category.value,
            description: form.description,
            date: form.date,
            type: 'pengeluaran',
        };

        try {
            if (editingId) {
                await api.put(`/transactions/${editingId}`, payload);
                alert('Pengeluaran berhasil diperbarui!');
            } else {
                await api.post('/transactions', payload);
                alert('Pengeluaran berhasil ditambahkan!');
            }
            fetchData();
            resetForm();
        } catch (error) {
            alert('Gagal memproses data');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            try {
                await api.delete(`/transactions/${id}`);
                alert('Transaksi berhasil dihapus!');
                fetchData();
            } catch (error) {
                alert('Gagal menghapus transaksi');
            }
        }
    };

    const handleEditClick = (transaction) => {
        setEditingId(transaction._id);
        setForm({
            accountId: transaction.account,
            amount: transaction.amount,
            category: { value: transaction.category, label: transaction.category },
            description: transaction.description,
            date: new Date(transaction.date).toISOString().split('T')[0],
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({
            ...form,
            amount: '',
            category: null,
            description: '',
            date: new Date().toISOString().split('T')[0],
        });
    };

    const customSelectStyles = {
        control: (provided) => ({ ...provided, backgroundColor: '#4A5568', borderColor: '#718096', color: 'white', boxShadow: 'none', '&:hover': { borderColor: '#A0AEC0' } }),
        menu: (provided) => ({ ...provided, backgroundColor: '#4A5568' }),
        option: (provided, state) => ({ ...provided, backgroundColor: state.isFocused ? '#2D3748' : '#4A5568', color: '#E2E8F0' }),
        singleValue: (provided) => ({ ...provided, color: '#E2E8F0' }),
        input: (provided) => ({ ...provided, color: '#E2E8F0' }),
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Pengeluaran Anda</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">{editingId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">Ambil dari Akun</label>
                            <select name="accountId" value={form.accountId} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" required>
                                {accounts.map(acc => (<option key={acc._id} value={acc._id}>{acc.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">Jumlah (Rp)</label>
                            <input type="text" inputMode="numeric" name="amount" value={formatRupiah(form.amount)} onChange={handleChange} placeholder="50.000" className="w-full p-2 rounded bg-gray-700 border border-gray-600" required />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">Kategori</label>
                            {isClient ? (
                                <ClientCreatableSelect isClearable options={categoryOptions} value={form.category} onChange={(newValue) => setForm(prev => ({ ...prev, category: newValue }))} onCreateOption={handleCreateCategory} placeholder="Pilih atau buat kategori..." styles={customSelectStyles} required />
                            ) : (
                                <div className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-400 h-[38px]">Memuat...</div>
                            )}
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">Deskripsi (Opsional)</label>
                            <input type="text" name="description" value={form.description} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">Tanggal</label>
                            <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" required />
                        </div>
                        <button type="submit" className="w-full py-2 font-bold text-gray-900 bg-green-400 rounded-md hover:bg-green-500 transition-colors">
                            {editingId ? 'Update Pengeluaran' : 'Simpan Pengeluaran'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="w-full mt-2 py-2 bg-gray-600 hover:bg-gray-500 rounded-md font-bold">Batal</button>
                        )}
                    </form>
                </div>
                <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Riwayat Pengeluaran</h2>
                    <div className="space-y-3">
                        {transactions.map((trans) => (
                            <div key={trans._id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                                <div>
                                    <p className="font-bold">{trans.category}</p>
                                    <p className="text-sm text-gray-400">{new Date(trans.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <p className="font-bold text-red-400">- Rp {trans.amount.toLocaleString('id-ID')}</p>
                                    <button onClick={() => handleEditClick(trans)} className="text-yellow-400 hover:text-yellow-300 text-sm">Edit</button>
                                    <button onClick={() => handleDelete(trans._id)} className="text-red-500 hover:text-red-400 text-sm">Hapus</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpensesPage;