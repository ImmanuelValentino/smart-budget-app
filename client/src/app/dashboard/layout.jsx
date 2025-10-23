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
        <div className="min-h-screen bg-gray-900 text-gray-50">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}