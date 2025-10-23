'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (storedUserInfo) {
            setUserInfo(storedUserInfo);
        }
    }, []);

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        router.push('/login');
    };

    const getLinkClass = (path) => {
        return pathname === path ? "text-green-400 font-semibold" : "hover:text-green-300";
    };

    return (
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
            <div className="text-2xl font-bold">
                <Link href="/dashboard" className="hover:text-green-400">SmartBudget</Link>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
                <Link href="/dashboard/income" className={getLinkClass('/dashboard/income')}>Pemasukan</Link>
                <Link href="/dashboard/expenses" className={getLinkClass('/dashboard/expenses')}>Pengeluaran</Link>
                <Link href="/dashboard/accounts" className={getLinkClass('/dashboard/accounts')}>Akun</Link>
                <Link href="/dashboard/budgets" className={getLinkClass('/dashboard/budgets')}>Budget</Link>
            </nav>
            <div className="flex items-center space-x-4">
                <span>Halo, {userInfo ? userInfo.nama : 'Guest'}</span>
                <button onClick={logoutHandler} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm font-medium">Logout</button>
            </div>
        </header>
    );
};

export default Header;