// src/components/Header.jsx
'use client'; // Tetap gunakan ini untuk interaktivitas

import React, { useState, useEffect } from 'react'; // 1. Import useState dan useEffect
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = () => {
    const router = useRouter();

    // 2. Buat state untuk userInfo, defaultnya null
    const [userInfo, setUserInfo] = useState(null);

    // 3. Gunakan useEffect untuk mengakses localStorage
    useEffect(() => {
        // Kode di dalam useEffect HANYA berjalan di sisi browser
        const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (storedUserInfo) {
            setUserInfo(storedUserInfo);
        }
    }, []); // [] artinya useEffect hanya berjalan sekali saat komponen dimuat di browser

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        router.push('/login');
    };

    return (
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
            <div className="text-2xl font-bold">
                <Link href="/dashboard" className="hover:text-green-400">
                    SmartBudget
                </Link>
            </div>
            <nav className="flex items-center space-x-6">
                <nav className="flex items-center space-x-6">
                    <Link href="/dashboard" className="hover:text-green-300">Dashboard</Link>
                    <Link href="/dashboard/income" className="hover:text-green-300">Pemasukan</Link>
                    <Link href="/dashboard/expenses" className="hover:text-green-300">Pengeluaran</Link>
                    <Link href="/dashboard/accounts" className="hover:text-green-300">Akun</Link>
                    <Link href="/dashboard/budgets" className="hover:text-green-300">Budget</Link> {/* <-- TAMBAHKAN INI */}
                </nav>
            </nav>
            <div className="flex items-center space-x-4">
                {/* 4. Tampilkan nama HANYA jika userInfo sudah terisi */}
                <span>Halo, {userInfo ? userInfo.nama : 'Guest'}</span>
                <button
                    onClick={logoutHandler}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm font-medium"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;  