'use client';

import React, { useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/register', { nama, email, password });
            alert('Registrasi berhasil! Silakan login.');
            router.push('/login');
        } catch (error) {
            const message = error.response ? error.response.data.message : error.message;
            alert(`Registrasi gagal: ${message}`);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-green-400">SmartBudget</h1>
                <h2 className="text-2xl font-semibold text-center">Create a New Account</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Nama</label>
                        <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" required />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 font-bold text-gray-900 bg-green-400 rounded-md hover:bg-green-500">Daftar</button>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-medium text-green-400 hover:underline">Login di sini</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;