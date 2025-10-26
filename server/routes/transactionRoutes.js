// server/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/transactionModel');
const Account = require('../models/accountModel');
// const User = require('../models/userModel'); // Tidak perlu import User di sini lagi

// @desc    Menambah transaksi baru (Pemasukan atau Pengeluaran)
// @route   POST /api/transactions
// @access  Private
router.post('/', protect, async (req, res) => {
    const { account: accountId, type, amount, category, description, date } = req.body;
    if (!accountId || !type || !amount || !category || !date) {
        return res.status(400).json({ message: 'Semua bidang wajib diisi: akun, tipe, jumlah, kategori, tanggal.' });
    }
    try {
        const account = await Account.findById(accountId);
        if (!account || account.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Akun tidak ditemukan atau tidak dimiliki oleh user.' });
        }
        // Update saldo akun
        if (type === 'pemasukan') account.balance += Number(amount);
        else if (type === 'pengeluaran') account.balance -= Number(amount);
        else return res.status(400).json({ message: 'Tipe transaksi tidak valid.' });
        await account.save();
        // Buat transaksi baru
        const transaction = new Transaction({
            user: req.user._id, account: accountId, type, amount: Number(amount), category, description, date: new Date(date),
        });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        console.error("Error saat menambah transaksi:", error);
        res.status(500).json({ message: 'Gagal menambah transaksi', error: error.message });
    }
});

// @desc    Mengambil semua transaksi milik user (dengan filter tanggal & tipe)
// @route   GET /api/transactions
// @access  Private
router.get('/', protect, async (req, res) => {
    const { startDate, endDate, type, filterDuration } = req.query; // Ambil semua parameter
    let dateFilter = {}; // Objek untuk filter tanggal
    let queryFilter = { user: req.user._id }; // Filter dasar berdasarkan user

    try {
        // Prioritaskan filter durasi (7_days, 30_days) jika ada
        if (filterDuration && filterDuration !== 'all') {
            const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
            let start = new Date(todayEnd);
            if (filterDuration === '7_days') start.setDate(todayEnd.getDate() - 6);
            else if (filterDuration === '30_days') start.setDate(todayEnd.getDate() - 29);
            start.setHours(0, 0, 0, 0);
            dateFilter = { $gte: start, $lte: todayEnd };
        }
        // Jika tidak ada filter durasi, gunakan startDate dan endDate (untuk dashboard)
        else if (startDate && endDate) {
            const endOfDay = new Date(endDate); endOfDay.setHours(23, 59, 59, 999);
            dateFilter = { $gte: new Date(startDate), $lte: endOfDay };
        }
        // Jika 'all' atau tidak ada filter tanggal, dateFilter tetap kosong

        // Gabungkan filter tanggal ke query utama
        if (Object.keys(dateFilter).length > 0) {
            queryFilter.date = dateFilter;
        }
        // Tambahkan filter tipe jika ada
        if (type) {
            queryFilter.type = type;
        }

        const transactions = await Transaction.find(queryFilter).sort({ date: -1 }); // Urutkan dari tanggal terbaru
        res.json(transactions); // Kirim hasil

    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Gagal mengambil transaksi", error: error.message });
    }
});


// @desc    Mengambil transaksi berdasarkan ID
// @route   GET /api/transactions/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        }
        res.json(transaction);
    } catch (error) {
        console.error("Error saat mengambil transaksi by ID:", error);
        res.status(500).json({ message: 'Gagal mengambil transaksi', error: error.message });
    }
});


// @desc    Mengupdate transaksi
// @route   PUT /api/transactions/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const {
        account: newAccountId,
        type: newType,
        amount: newAmountString,
        category: newCategory,
        description: newDescription,
        date: newDate
    } = req.body;

    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        }

        const oldAccount = await Account.findById(transaction.account);
        const effectiveNewAccountId = newAccountId || transaction.account.toString();
        const newAccount = await Account.findById(effectiveNewAccountId);

        if (!oldAccount || !newAccount || oldAccount.user.toString() !== req.user._id.toString() || newAccount.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Akun lama atau akun baru tidak valid.' });
        }

        // --- 👇👇 LOGIKA PERBAIKAN SALDO EDIT YANG BENAR 👇👇 ---
        const oldAmount = transaction.amount;
        const oldType = transaction.type;
        const isAccountChanged = oldAccount._id.toString() !== newAccount._id.toString();

        const effectiveNewAmount = Number(newAmountString) || oldAmount;
        const effectiveNewType = newType || oldType;

        // Hitung selisih/perubahan saldo yang HARUS diterapkan
        let balanceAdjustment = 0;

        // Jika tipe sama, hitung selisih amount
        if (oldType === effectiveNewType) {
            if (oldType === 'pemasukan') {
                balanceAdjustment = effectiveNewAmount - oldAmount; // Contoh: 10rb - 5rb = +5rb
            } else { // pengeluaran
                balanceAdjustment = oldAmount - effectiveNewAmount; // Contoh: 5rb - 10rb = -5rb (kurangi lagi 5rb)
            }
        }
        // Jika tipe berubah
        else {
            // Balikkan efek lama DAN terapkan efek baru
            if (oldType === 'pemasukan') { // Dari pemasukan jadi pengeluaran
                balanceAdjustment = -oldAmount - effectiveNewAmount; // Kurangi yg lama, kurangi lagi yg baru
            } else { // Dari pengeluaran jadi pemasukan
                balanceAdjustment = oldAmount + effectiveNewAmount; // Tambah yg lama (kembali), tambah lagi yg baru
            }
        }

        // Terapkan perubahan saldo
        if (isAccountChanged) {
            // Rollback di akun lama
            if (oldType === 'pemasukan') oldAccount.balance -= oldAmount;
            else oldAccount.balance += oldAmount;
            await oldAccount.save();

            // Terapkan di akun baru
            if (effectiveNewType === 'pemasukan') newAccount.balance += effectiveNewAmount;
            else newAccount.balance -= effectiveNewAmount;
            await newAccount.save();
        } else {
            // Jika akun sama, terapkan penyesuaian total
            // 'newAccount' dan 'oldAccount' merujuk ke objek yang sama
            newAccount.balance += balanceAdjustment;
            await newAccount.save();
        }
        // --- 👆👆 AKHIR LOGIKA PERBAIKAN SALDO EDIT 👆👆 ---

        // Update data transaksi
        transaction.account = effectiveNewAccountId;
        transaction.type = effectiveNewType;
        transaction.amount = effectiveNewAmount;
        transaction.category = newCategory || transaction.category;
        transaction.description = newDescription !== undefined ? newDescription : transaction.description;
        transaction.date = newDate ? new Date(newDate) : transaction.date;

        await transaction.save();
        res.json(transaction);

    } catch (error) {
        console.error("Error saat mengupdate transaksi:", error);
        res.status(500).json({ message: 'Gagal mengupdate transaksi', error: error.message });
    }
});


// @desc    Menghapus transaksi
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        }
        const account = await Account.findById(transaction.account);
        if (account && account.user.toString() === req.user._id.toString()) {
            if (transaction.type === 'pemasukan') account.balance -= transaction.amount;
            else account.balance += transaction.amount;
            await account.save();
        } else {
            console.warn(`Akun ${transaction.account} tidak valid saat menghapus transaksi ${transaction._id}.`);
        }
        await Transaction.deleteOne({ _id: req.params.id });
        res.json({ message: 'Transaksi berhasil dihapus.' });
    } catch (error) {
        console.error("Error saat menghapus transaksi:", error);
        res.status(500).json({ message: 'Gagal menghapus transaksi', error: error.message });
    }
});

module.exports = router;