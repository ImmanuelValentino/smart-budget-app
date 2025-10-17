import axios from 'axios';

// Buat instance axios dengan konfigurasi default
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // URL dasar backend Anda
});

// Ini adalah "interceptor" yang akan berjalan sebelum SETIAP permintaan dikirim
api.interceptors.request.use(
    (config) => {
        // Ambil data userInfo dari localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        // Jika ada, tambahkan token ke header Authorization
        if (userInfo && userInfo.token) {
            config.headers['Authorization'] = `Bearer ${userInfo.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;