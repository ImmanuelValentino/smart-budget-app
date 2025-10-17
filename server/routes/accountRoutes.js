const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Account = require('../models/accountModel');
const Transaction = require('../models/transactionModel');

// @desc    Membuat akun baru
// @route   POST /api/accounts
// @access  Private
router.post('/', protect, async (req, res) => {
    const { name, balance } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Nama akun tidak boleh kosong' });
    }
    const accountExists = await Account.findOne({
        user: req.user._id,
        name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (accountExists) {
        return res.status(400).json({ message: 'Nama akun sudah ada. Silakan gunakan nama lain.' });
    }
    const account = await Account.create({
        user: req.user._id,
        name,
        balance: balance || 0,
    });

    res.status(201).json(account);
});

// @desc    Mengambil semua akun milik user
// @route   GET /api/accounts
// @access  Private
router.get('/', protect, async (req, res) => {
    const accounts = await Account.find({ user: req.user._id });
    res.json(accounts);
});

// @desc    Update sebuah akun (hanya nama)
// @route   PUT /api/accounts/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const account = await Account.findById(req.params.id);

    if (account && account.user.toString() === req.user.id) {
        account.name = req.body.name || account.name;

        const updatedAccount = await account.save();
        res.json(updatedAccount);
    } else {
        res.status(404).json({ message: 'Akun tidak ditemukan atau user tidak berwenang' });
    }
});

// @desc    Hapus sebuah akun
// @route   DELETE /api/accounts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    const account = await Account.findById(req.params.id);

    if (account && account.user.toString() === req.user.id) {
        // Cek apakah akun masih memiliki transaksi
        const transactions = await Transaction.find({ account: req.params.id });
        if (transactions.length > 0) {
            return res.status(400).json({ message: 'Tidak bisa menghapus akun yang masih memiliki transaksi.' });
        }

        await account.deleteOne();
        res.json({ message: 'Akun berhasil dihapus' });
    } else {
        res.status(404).json({ message: 'Akun tidak ditemukan atau user tidak berwenang' });
    }
});

module.exports = router;