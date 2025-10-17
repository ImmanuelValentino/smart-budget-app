const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/transactionModel');
const Account = require('../models/accountModel');

// @desc    Membuat transaksi baru
// @route   POST /api/transactions
// @access  Private
router.post('/', protect, async (req, res) => {
    const { type, category, amount, description, accountId, date } = req.body;
    if (!type || !category || !amount || !accountId) {
        return res.status(400).json({ message: 'Mohon lengkapi semua field.' });
    }
    const account = await Account.findById(accountId);
    if (!account || account.user.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Akun tidak ditemukan atau tidak berwenang' });
    }
    if (type === 'pemasukan') {
        account.balance += Number(amount);
    } else {
        account.balance -= Number(amount);
    }
    await account.save();
    const transaction = await Transaction.create({
        user: req.user._id, account: accountId, type, category, amount, description, date: date || new Date(),
    });
    res.status(201).json(transaction);
});

// @desc    Mengambil semua transaksi milik user
// @route   GET /api/transactions
// @access  Private
router.get('/', protect, async (req, res) => {
    const { startDate, endDate } = req.query; // Ambil tanggal dari query parameter

    let filter = { user: req.user._id };

    // Jika ada startDate dan endDate, tambahkan ke filter
    if (startDate && endDate) {
        filter.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
});

// @desc    Update sebuah transaksi
// @route   PUT /api/transactions/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);

    if (transaction && transaction.user.toString() === req.user.id) {
        // 1. Kembalikan saldo dari transaksi lama
        const originalAccount = await Account.findById(transaction.account);
        if (originalAccount) {
            if (transaction.type === 'pemasukan') {
                originalAccount.balance -= transaction.amount;
            } else {
                originalAccount.balance += transaction.amount;
            }
            await originalAccount.save();
        }

        // 2. Terapkan saldo ke akun baru (atau akun yang sama dengan nilai baru)
        const newAmount = req.body.amount || transaction.amount;
        const newType = req.body.type || transaction.type;
        const newAccountId = req.body.accountId || transaction.account.toString();
        const newAccount = await Account.findById(newAccountId);
        if (newAccount) {
            if (newType === 'pemasukan') {
                newAccount.balance += Number(newAmount);
            } else {
                newAccount.balance -= Number(newAmount);
            }
            await newAccount.save();
        }

        // 3. Update data transaksinya
        transaction.type = newType;
        transaction.category = req.body.category || transaction.category;
        transaction.amount = newAmount;
        transaction.description = req.body.description !== undefined ? req.body.description : transaction.description;
        transaction.date = req.body.date || transaction.date;
        transaction.account = newAccountId;

        const updatedTransaction = await transaction.save();
        res.json(updatedTransaction);
    } else {
        res.status(404).json({ message: 'Transaksi tidak ditemukan atau user tidak berwenang' });
    }
});

// @desc    Hapus sebuah transaksi
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);

    if (transaction && transaction.user.toString() === req.user.id) {
        const account = await Account.findById(transaction.account);
        if (account) {
            if (transaction.type === 'pemasukan') {
                account.balance -= transaction.amount;
            } else {
                account.balance += transaction.amount;
            }
            await account.save();
        }

        await transaction.deleteOne();
        res.json({ message: 'Transaksi berhasil dihapus' });
    } else {
        res.status(404).json({ message: 'Transaksi tidak ditemukan atau user tidak berwenang' });
    }
});

module.exports = router;
// PUT /api/transactions/:id (Logika update lebih kompleks, kita sederhanakan dulu)
// ... (bisa ditambahkan nanti) ...
