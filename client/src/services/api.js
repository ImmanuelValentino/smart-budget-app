import axios from 'axios';

// Menggunakan nama variabel baru dari Vercel
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: baseURL,
});

// Log ini untuk memastikan URL yang benar digunakan saat build
console.log(`[API Service] Using baseURL: ${baseURL}`);

// Interceptor untuk token
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