'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dynamic from 'next/dynamic';

const ClientCreatableSelect = dynamic(() => import('@/components/ClientCreatableSelect'), {
    ssr: false,
    loading: () => <div className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-400 h-[42px]">Memuat...</div>
});

const ExpensesPage = () => {
    const router = useRouter();
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]); // Menyimpan array string nama kategori
    const [selectedAccount, setSelectedAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null); // State untuk react-select {value, label}
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [expenses, setExpenses] = useState([]);
    const [filter, setFilter] = useState('7_days');
    const [editingId, setEditingId] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isClient, setIsClient] = useState(false);

    // Fungsi format Rupiah
    const formatRupiah = (angka) => {
        if (!angka || Number(angka) === 0) return '';
        const number = Number(String(angka).replace(/[^0-9]/g, ''));
        return new Intl.NumberFormat('id-ID').format(number);
    };

    // Fungsi untuk mengambil semua data
    const fetchData = useCallback(async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo || !userInfo.token) { router.push('/login'); return; }
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const [accRes, catRes, transRes] = await Promise.all([
                api.get('/accounts', config),
                api.get('/categories', config),
                api.get('/transactions', { ...config, params: { type: 'pengeluaran', filterDuration: filter } })
            ]);

            setAccounts(accRes.data);
            if (accRes.data.length > 0 && !selectedAccount && !editingId) {
                setSelectedAccount(accRes.data[0]._id);
            }

            const expenseCategories = catRes.data.pengeluaran || [];
            setCategories(expenseCategories.map(cat => ({ value: cat, label: cat })));
            // Jangan set default category di sini agar reset form bekerja benar

            setExpenses(transRes.data.sort((a, b) => new Date(b.date) - new Date(a.date)));

        } catch (error) {
            console.error("Gagal mengambil data:", error);
            toast.error("Gagal memuat data.");
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('userInfo');
                router.push('/login');
            }
        }
    }, [filter, selectedAccount, editingId, router]);

    useEffect(() => {
        setIsClient(true);
        fetchData();
    }, [fetchData]);

    // Fungsi untuk membuat kategori baru
    const handleCreateCategory = async (inputValue) => {
        if (!inputValue) { toast.warn("Nama kategori baru tidak boleh kosong."); return; }
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) return;
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const res = await api.post('/categories', { name: inputValue, type: 'pengeluaran' }, config);
            const newCategory = { value: res.data.name, label: res.data.name };
            setCategories(prev => [...prev, newCategory]);
            setSelectedCategory(newCategory);
            toast.success("Kategori baru ditambahkan!");
        } catch (error) {
            console.error("Gagal menambahkan kategori:", error);
            toast.error(error.response?.data?.message || "Gagal menambahkan kategori.");
        }
    };

    // Fungsi untuk menangani perubahan input form
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            const rawValue = value.replace(/[^0-9]/g, '');
            setAmount(rawValue);
        } else if (name === 'date') {
            setDate(value);
        } else if (name === 'description') {
            setDescription(value);
        } else if (name === 'account') {
            setSelectedAccount(value);
        }
        // Kategori ditangani oleh react-select onChange
    };

    // Fungsi untuk mereset form
    const resetForm = () => {
        setEditingId(null);
        setAmount('');
        setSelectedCategory(null);
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        // Jangan reset selectedAccount
    };

    // Fungsi untuk submit form (Create atau Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAccount || !amount || !selectedCategory || !date) {
            toast.error("Mohon lengkapi Akun, Jumlah, Kategori, dan Tanggal.");
            return;
        }
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) return;

        const payload = {
            account: selectedAccount,
            type: 'pengeluaran',
            amount: Number(amount),
            category: selectedCategory.value,
            description,
            date,
        };

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            if (editingId) {
                await api.put(`/transactions/${editingId}`, payload, config);
                toast.success("Pengeluaran berhasil diperbarui!");
            } else {
                await api.post('/transactions', payload, config);
                toast.success("Pengeluaran berhasil ditambahkan!");
            }
            fetchData();
            resetForm();
        } catch (error) {
            console.error("Gagal menyimpan pengeluaran:", error);
            toast.error(error.response?.data?.message || "Gagal menyimpan pengeluaran.");
        }
    };

    // Fungsi untuk menghapus transaksi
    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus pengeluaran ini?")) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) return;
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await api.delete(`/transactions/${id}`, config);
            toast.success("Pengeluaran berhasil dihapus!");
            fetchData();
        } catch (error) {
            console.error("Gagal menghapus pengeluaran:", error);
            toast.error("Gagal menghapus pengeluaran.");
        }
    };

    // Fungsi untuk memulai mode edit
    const handleEditClick = (expense) => {
        setEditingId(expense._id);
        setSelectedAccount(expense.account);
        setAmount(expense.amount.toString());
        const categoryObject = categories.find(opt => opt.value === expense.category);
        setSelectedCategory(categoryObject || { value: expense.category, label: expense.category });
        setDescription(expense.description || '');
        setDate(new Date(expense.date).toISOString().split('T')[0]);
    };

    // Styling react-select
    const customSelectStyles = {
        control: (provided) => ({ ...provided, backgroundColor: '#374151', borderColor: '#4B5563', color: 'white', boxShadow: 'none', '&:hover': { borderColor: '#6B7280' } }),
        menu: (provided) => ({ ...provided, backgroundColor: '#374151', zIndex: 50 }),
        option: (provided, state) => ({ ...provided, backgroundColor: state.isFocused ? '#1F2937' : '#374151', color: '#F9FAFB' }),
        singleValue: (provided) => ({ ...provided, color: '#F9FAFB' }),
        input: (provided) => ({ ...provided, color: '#F9FAFB' }),
        placeholder: (provided) => ({ ...provided, color: '#9CA3AF' }),
    };


    return (
        <div className="space-y-8 p-4 md:p-6 text-white">
            <ToastContainer theme="dark" position="bottom-right" autoClose={3000} />
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Kelola Pengeluaran</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom Form */}
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">{editingId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="account" className="block text-sm font-medium text-gray-400 mb-1">Ambil dari Akun</label>
                            <select id="account" name="account" value={selectedAccount} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" required >
                                <option value="" disabled>Pilih Akun</option>
                                {accounts.map(acc => (
                                    <option key={acc._id} value={acc._id}>{acc.name} (Rp {acc.balance.toLocaleString('id-ID')})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-1">Jumlah (Rp)</label>
                            <input type="text" inputMode="numeric" id="amount" name="amount" value={formatRupiah(amount)} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" placeholder="Contoh: 50.000" required />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-1">Kategori</label>
                            {isClient ? (
                                <ClientCreatableSelect
                                    instanceId="expense-category-select"
                                    isClearable
                                    options={categories}
                                    value={selectedCategory}
                                    onChange={(newValue) => setSelectedCategory(newValue)}
                                    onCreateOption={handleCreateCategory}
                                    placeholder="Pilih atau buat kategori..."
                                    styles={customSelectStyles}
                                    required
                                    inputId="category-expense-input"
                                />
                            ) : (
                                <div className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-400 h-[42px] text-sm">Memuat kategori...</div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">Deskripsi (Opsional)</label>
                            <input type="text" id="description" name="description" value={description} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" placeholder="Makan siang" />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">Tanggal</label>
                            <input type="date" id="date" name="date" value={date} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" required />
                        </div>
                        <button type="submit" className="w-full py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500">
                            {editingId ? 'Update Pengeluaran' : 'Simpan Pengeluaran'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="w-full mt-2 py-2 bg-gray-600 hover:bg-gray-500 rounded-md font-bold text-white">Batal</button>
                        )}
                    </form>
                </div>

                {/* Kolom Riwayat */}
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
                        <h2 className="text-xl md:text-2xl font-semibold whitespace-nowrap">Riwayat Pengeluaran</h2>
                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                            <label htmlFor="filter" className="text-gray-400 text-sm whitespace-nowrap">Tampilkan:</label>
                            <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500 w-auto" >
                                <option value="7_days">7 Hari Terakhir</option>
                                <option value="30_days">30 Hari Terakhir</option>
                                <option value="all">Semua</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2"> {/* Atur tinggi maksimal */}
                        {expenses.length > 0 ? (
                            expenses.map((expense) => (
                                <div key={expense._id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-700 p-3 rounded gap-2 sm:gap-0">
                                    <div>
                                        <p className="font-bold text-sm md:text-base">{expense.category}</p>
                                        <p className="text-xs md:text-sm text-gray-400">{new Date(expense.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        {expense.description && <p className="text-xs text-gray-500 italic mt-1">{expense.description}</p>}
                                    </div>
                                    <div className="flex items-center space-x-2 self-end sm:self-center mt-2 sm:mt-0">
                                        <p className="font-bold text-red-400 text-sm md:text-base">- Rp {expense.amount.toLocaleString('id-ID')}</p>
                                        <button onClick={() => handleEditClick(expense)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-2 md:px-3 rounded-md text-xs">Edit</button>
                                        <button onClick={() => handleDelete(expense._id)} className="bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-2 md:px-3 rounded-md text-xs">Hapus</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-10">Tidak ada pengeluaran pada periode ini.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpensesPage;