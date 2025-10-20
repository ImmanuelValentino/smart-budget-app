const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const startServer = async () => {
    try {
        await connectDB();
        const app = express();
        const port = process.env.PORT || 5000;

        // --- 👇👇 PERBARUI KONFIGURASI CORS DI SINI 👇👇 ---
        const corsOptions = {
            // Ganti dengan URL Vercel Anda yang sebenarnya
            origin: 'https://smart-budget-app-taupe.vercel.app/',
            optionsSuccessStatus: 200
        };
        app.use(cors(corsOptions));
        // --- 👆👆 BATAS AKHIR PERUBAHAN 👆👆 ---

        app.use(express.json());

        app.use('/api/users', require('./routes/userRoutes'));
        app.use('/api/transactions', require('./routes/transactionRoutes'));
        app.use('/api/categories', require('./routes/categoryRoutes'));
        app.use('/api/accounts', require('./routes/accountRoutes'));
        app.use('/api/budgets', require('./routes/budgetRoutes'));

        app.get('/', (req, res) => {
            res.send('API is running successfully!');
        });

        app.listen(port, () => {
            console.log(`🚀 Server berjalan di port: ${port}`);
        });

    } catch (error) {
        console.error("Gagal menjalankan server:", error);
        process.exit(1);
    }
};

startServer();