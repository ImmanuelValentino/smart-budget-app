'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function DashboardLayout({ children }) {
    const router = useRouter();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Header />
            {/* Ubah padding: p-4 di mobile, p-8 di layar medium ke atas */}
            <main className="p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}