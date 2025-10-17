'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';

const BudgetsPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [form, setForm] = useState({ name: '', amount: '', startDate: '', endDate: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const { data } = await api.get('/budgets');
            setBudgets(data);
        } catch (error) {
            console.error("Gagal mengambil data budget", error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/budgets/${editingId}`, { ...form, amount: Number(form.amount) });
                alert('Budget berhasil diperbarui!');
            } else {
                await api.post('/budgets', { ...form, amount: Number(form.amount) });
                alert('Budget baru berhasil ditambahkan!');
            }
            fetchBudgets();
            resetForm();
        } catch (error) {
            alert('Gagal memproses budget');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus budget ini?')) {
            try {
                await api.delete(`/budgets/${id}`);
                alert('Budget berhasil dihapus!');
                fetchBudgets();
            } catch (error) {
                alert('Gagal menghapus budget');
            }
        }
    };

    const handleEditClick = (budget) => {
        setEditingId(budget._id);
        setForm({
            name: budget.name,
            amount: budget.amount,
            startDate: new Date(budget.startDate).toISOString().split('T')[0],
            endDate: new Date(budget.endDate).toISOString().split('T')[0],
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ name: '', amount: '', startDate: '', endDate: '' });
    };

    const ProgressBar = ({ spent, total }) => {
        const percentage = total > 0 ? (spent / total) * 100 : 0;
        const color = percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500';
        return (
            <div>
                <div className="w-full bg-gray-600 rounded-full h-4">
                    <div className={`${color} h-4 rounded-full`} style={{ width: `${percentage > 100 ? 100 : percentage}%` }}></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">Terpakai: Rp {spent.toLocaleString('id-ID')} dari Rp {total.toLocaleString('id-ID')}</p>
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Kelola Anggaran (Budget)</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">{editingId ? 'Edit Budget' : 'Buat Budget Baru'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">Nama Budget</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Contoh: Belanja Bulanan" className="w-full px-4 py-2 text-white bg-gray-700 rounded-md border border-gray-600" required />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">Jumlah Anggaran (Rp)</label>
                            <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="1000000" className="w-full px-4 py-2 text-white bg-gray-700 rounded-md border border-gray-600" required />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">Tanggal Mulai</label>
                            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full px-4 py-2 text-white bg-gray-700 rounded-md border border-gray-600" required />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">Tanggal Selesai</label>
                            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full px-4 py-2 text-white bg-gray-700 rounded-md border border-gray-600" required />
                        </div>
                        <button type="submit" className="w-full py-2 font-bold text-gray-900 bg-green-400 rounded-md hover:bg-green-500">
                            {editingId ? 'Update Budget' : 'Simpan Budget'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="w-full mt-2 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Batal</button>
                        )}
                    </form>
                </div>
                <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Daftar Budget Anda</h2>
                    <div className="space-y-6">
                        {budgets.map((budget) => (
                            <div key={budget._id} className="bg-gray-700 p-4 rounded">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg">{budget.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(budget.startDate).toLocaleDateString('id-ID')} - {new Date(budget.endDate).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => handleEditClick(budget)} className="text-yellow-400 text-sm hover:text-yellow-300">Edit</button>
                                        <button onClick={() => handleDelete(budget._id)} className="text-red-500 text-sm hover:text-red-400">Hapus</button>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <ProgressBar spent={budget.spent} total={budget.amount} />
                                    <p className="text-xs text-gray-400 mt-2 text-right">Sisa: Rp {budget.remaining.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetsPage;