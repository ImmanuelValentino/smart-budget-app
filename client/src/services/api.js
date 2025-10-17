import axios from 'axios';

const api = axios.create({
    // Saat di Vercel, ini akan menggunakan URL dari Railway.
    // Saat di komputer lokal, ini akan menggunakan localhost.
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Interceptor untuk menambahkan token otorisasi secara otomatis
api.interceptors.request.use(
    (config) => {
        // Cek hanya jika kode berjalan di sisi browser
        if (typeof window !== 'undefined') {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo && userInfo.token) {
                config.headers['Authorization'] = `Bearer ${userInfo.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;