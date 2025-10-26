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

const IncomePage = () => {
    const router = useRouter();
    const [accounts, setAccounts] = useState([]);
    // --- PASTIKAN STATE INI DIDEKLARASIKAN ---
    const [categoryOptions, setCategoryOptions] = useState([]); // Inisialisasi sebagai array kosong
    // ---
    const [selectedAccount, setSelectedAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [incomes, setIncomes] = useState([]);
    const [filter, setFilter] = useState('7_days');
    const [editingId, setEditingId] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isClient, setIsClient] = useState(false);

    const formatRupiah = (angka) => {
        if (!angka || Number(angka) === 0) return '';
        const number = Number(String(angka).replace(/[^0-9]/g, ''));
        return new Intl.NumberFormat('id-ID').format(number);
    };

    const fetchData = useCallback(async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
            router.push('/login');
            return;
        }
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            const [accRes, catRes, transRes] = await Promise.all([
                api.get('/accounts', config),
                api.get('/categories', config),
                api.get('/transactions', { ...config, params: { type: 'pemasukan', filterDuration: filter } })
            ]);

            setAccounts(accRes.data);
            if (accRes.data.length > 0 && !selectedAccount && !editingId) {
                setSelectedAccount(accRes.data[0]._id);
            }

            const incomeCategories = catRes.data.pemasukan || [];
            // --- PASTIKAN STATE DIISI DI SINI ---
            setCategoryOptions(incomeCategories.map(cat => ({ value: cat, label: cat })));
            // ---

            // Set default category hanya jika membuat baru dan kategori ada
            if (!editingId && incomeCategories.length > 0 && !selectedCategory) {
                // Pilih kategori pertama dari daftar yang sudah diformat
                setSelectedCategory({ value: incomeCategories[0], label: incomeCategories[0] });
            }

            setIncomes(transRes.data.sort((a, b) => new Date(b.date) - new Date(a.date)));

        } catch (error) {
            console.error("Gagal mengambil data:", error);
            toast.error("Gagal memuat data.");
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('userInfo');
                router.push('/login');
            }
        }
    }, [filter, selectedAccount, editingId, router, selectedCategory]); // Tambahkan selectedCategory

    useEffect(() => {
        setIsClient(true);
        fetchData();
    }, [fetchData]);

    const handleCreateCategory = async (inputValue) => {
        if (!inputValue) { toast.warn("Nama kategori baru tidak boleh kosong."); return; }
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) return;
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            const res = await api.post('/categories', { name: inputValue, type: 'pemasukan' }, config);
            const newCategory = { value: res.data.name, label: res.data.name };
            setCategoryOptions(prev => [...prev, newCategory]);
            setSelectedCategory(newCategory);
            toast.success("Kategori baru ditambahkan!");
        } catch (error) {
            console.error("Gagal menambahkan kategori:", error);
            toast.error(error.response?.data?.message || "Gagal menambahkan kategori.");
        }
    };

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
    };

    const resetForm = () => {
        setEditingId(null);
        setAmount('');
        // Reset ke kategori pertama jika ada, atau null
        setSelectedCategory(categoryOptions.length > 0 ? categoryOptions[0] : null);
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
    };

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
            type: 'pemasukan',
            amount: Number(amount),
            category: selectedCategory.value,
            description,
            date,
        };

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            if (editingId) {
                await api.put(`/transactions/${editingId}`, payload, config);
                toast.success("Pemasukan berhasil diperbarui!");
            } else {
                await api.post('/transactions', payload, config);
                toast.success("Pemasukan berhasil ditambahkan!");
            }
            fetchData();
            resetForm();
        } catch (error) {
            console.error("Gagal menyimpan pemasukan:", error);
            toast.error(error.response?.data?.message || "Gagal menyimpan pemasukan.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus pemasukan ini?")) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) return;
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await api.delete(`/transactions/${id}`, config);
            toast.success("Pemasukan berhasil dihapus!");
            fetchData();
        } catch (error) {
            console.error("Gagal menghapus pemasukan:", error);
            toast.error("Gagal menghapus pemasukan.");
        }
    };

    const handleEditClick = (income) => {
        setEditingId(income._id);
        setSelectedAccount(income.account);
        setAmount(income.amount.toString());
        const categoryObject = categoryOptions.find(opt => opt.value === income.category);
        setSelectedCategory(categoryObject || { value: income.category, label: income.category });
        setDescription(income.description || '');
        setDate(new Date(income.date).toISOString().split('T')[0]);
    };

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
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Pemasukan Anda</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom Form */}
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">{editingId ? 'Edit Pemasukan' : 'Tambah Pemasukan Baru'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="account" className="block text-sm font-medium text-gray-400 mb-1">Masuk ke Akun</label>
                            <select id="account" name="account" value={selectedAccount} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" required >
                                <option value="" disabled>Pilih Akun</option>
                                {accounts.map(acc => (
                                    <option key={acc._id} value={acc._id}>{acc.name} (Rp {acc.balance.toLocaleString('id-ID')})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-1">Jumlah (Rp)</label>
                            <input type="text" inputMode="numeric" id="amount" name="amount" value={formatRupiah(amount)} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" placeholder="1.000.000" required />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-1">Kategori</label>
                            {isClient ? (
                                <ClientCreatableSelect
                                    instanceId="income-category-select"
                                    isClearable
                                    options={categoryOptions} // Gunakan state ini
                                    value={selectedCategory}
                                    onChange={(newValue) => setSelectedCategory(newValue)}
                                    onCreateOption={handleCreateCategory}
                                    placeholder="Pilih atau buat kategori..."
                                    styles={customSelectStyles}
                                    required
                                    inputId="category-income-input"
                                />
                            ) : (
                                <div className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-400 h-[42px] text-sm">Memuat kategori...</div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">Deskripsi (Opsional)</label>
                            <input type="text" id="description" name="description" value={description} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" placeholder="Gaji bulanan" />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">Tanggal</label>
                            <input type="date" id="date" name="date" value={date} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" required />
                        </div>
                        <button type="submit" className="w-full py-2 font-bold text-gray-900 bg-green-400 rounded-md hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-400">
                            {editingId ? 'Update Pemasukan' : 'Simpan Pemasukan'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="w-full mt-2 py-2 bg-gray-600 hover:bg-gray-500 rounded-md font-bold text-white">Batal</button>
                        )}
                    </form>
                </div>
                {/* Kolom Riwayat */}
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
                        <h2 className="text-xl md:text-2xl font-semibold whitespace-nowrap">Riwayat Pemasukan</h2>
                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                            <label htmlFor="filter" className="text-gray-400 text-sm whitespace-nowrap">Tampilkan:</label>
                            <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500 w-auto" >
                                <option value="7_days">7 Hari Terakhir</option>
                                <option value="30_days">30 Hari Terakhir</option>
                                <option value="all">Semua</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {incomes.length > 0 ? (
                            incomes.map((income) => (
                                <div key={income._id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-700 p-3 rounded gap-2 sm:gap-0">
                                    <div>
                                        <p className="font-bold text-sm md:text-base">{income.category}</p>
                                        <p className="text-xs md:text-sm text-gray-400">{new Date(income.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        {income.description && <p className="text-xs text-gray-500 italic mt-1">{income.description}</p>}
                                    </div>
                                    <div className="flex items-center space-x-2 self-end sm:self-center mt-2 sm:mt-0">
                                        <p className="font-bold text-green-400 text-sm md:text-base">+ Rp {income.amount.toLocaleString('id-ID')}</p>
                                        <button onClick={() => handleEditClick(income)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-2 md:px-3 rounded-md text-xs">Edit</button>
                                        <button onClick={() => handleDelete(income._id)} className="bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-2 md:px-3 rounded-md text-xs">Hapus</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-10">Tidak ada pemasukan pada periode ini.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomePage;