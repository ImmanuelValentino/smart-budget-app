import axios from 'axios';

// Tentukan baseURL berdasarkan lingkungan (production atau development)
const baseURL = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL // Ini HARUS digunakan saat di Vercel
    : 'http://localhost:5000/api';     // Ini hanya untuk development di komputer Anda

const api = axios.create({
    baseURL: baseURL,
});

// Log ini akan muncul di build log Vercel untuk kita periksa
console.log(`API Service is using baseURL: ${baseURL}`);

// Interceptor untuk menambahkan token otorisasi secara otomatis
api.interceptors.request.use(
    (config) => {
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