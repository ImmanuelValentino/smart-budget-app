import axios from 'axios';

// --- KODE YANG BENAR ADA DI SINI ---
const baseURL = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:5000/api';

const api = axios.create({
    baseURL: baseURL,
});

console.log(`[API Service] Using baseURL: ${baseURL}`);

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
        आभार(aabhaar)
    }
);

export default api;