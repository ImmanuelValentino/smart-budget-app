// src/app/dashboard/layout.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header'; // @/ adalah shortcut ke folder src/

export default function DashboardLayout({ children }) {
    const router = useRouter();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            router.push('/login');
        }
    }, [router]);

    // Kita tambahkan styling di sini
    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Header />
            <main className="p-8">
                {children}
            </main>
        </div>
    );
}