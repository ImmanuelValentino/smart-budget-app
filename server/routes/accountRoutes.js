const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Account = require('../models/accountModel');
const Transaction = require('../models/transactionModel'); // Pastikan ini di-import

// @desc    Membuat akun baru DAN mencatat saldo awal sebagai transaksi
// @route   POST /api/accounts
// @access  Private
router.post('/', protect, async (req, res) => {
    const { name, balance } = req.body;
    const initialBalance = Number(balance) || 0; // Pastikan balance adalah angka

    if (!name) {
        return res.status(400).json({ message: 'Nama akun tidak boleh kosong' });
    }

    // Cek duplikasi nama akun (case-insensitive)
    const accountExists = await Account.findOne({
        user: req.user._id,
        name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (accountExists) {
        return res.status(400).json({ message: 'Nama akun sudah ada. Silakan gunakan nama lain.' });
    }

    try {
        // 1. Buat Akun Baru
        const account = await Account.create({
            user: req.user._id,
            name,
            balance: initialBalance, // Set saldo awal di akun
        });


        res.status(201).json(account);

    } catch (error) {
        console.error("Error saat membuat akun:", error);
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat akun' });
    }
});

// @desc    Mengambil semua akun milik user
// @route   GET /api/accounts
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const accounts = await Account.find({ user: req.user._id }).sort({ name: 1 }); // Urutkan berdasarkan nama
        res.json(accounts);
    } catch (error) {
        console.error("Error saat mengambil akun:", error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil akun' });
    }
});

// @desc    Update sebuah akun (hanya nama)
// @route   PUT /api/accounts/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (account && account.user.toString() === req.user.id) {
            // Cek duplikasi nama jika nama diubah
            if (req.body.name && req.body.name.toLowerCase() !== account.name.toLowerCase()) {
                const nameExists = await Account.findOne({
                    user: req.user._id,
                    name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
                    _id: { $ne: req.params.id } // Kecuali akun ini sendiri
                });
                if (nameExists) {
                    return res.status(400).json({ message: 'Nama akun tersebut sudah digunakan.' });
                }
            }

            account.name = req.body.name || account.name;
            const updatedAccount = await account.save();
            res.json(updatedAccount);
        } else {
            res.status(404).json({ message: 'Akun tidak ditemukan atau user tidak berwenang' });
        }
    } catch (error) {
        console.error("Error saat update akun:", error);
        res.status(500).json({ message: 'Terjadi kesalahan saat update akun' });
    }
});

// @desc    Hapus sebuah akun
// @route   DELETE /api/accounts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (account && account.user.toString() === req.user.id) {
            const transactions = await Transaction.find({ account: req.params.id });
            if (transactions.length > 0) {
                return res.status(400).json({ message: 'Tidak bisa menghapus akun yang masih memiliki transaksi.' });
            }

            await account.deleteOne();
            res.json({ message: 'Akun berhasil dihapus' });
        } else {
            res.status(404).json({ message: 'Akun tidak ditemukan atau user tidak berwenang' });
        }
    } catch (error) {
        console.error("Error saat hapus akun:", error);
        res.status(500).json({ message: 'Terjadi kesalahan saat hapus akun' });
    }
});

module.exports = router;