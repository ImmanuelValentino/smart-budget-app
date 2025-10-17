// server/routes/budgetRoutes.js

const express = require('express');
const router = express.Router(); // <-- PASTIKAN BARIS INI ADA
const { protect } = require('../middleware/authMiddleware');
const Budget = require('../models/budgetModel');
const Transaction = require('../models/transactionModel');

// POST /api/budgets (Membuat budget baru)
router.post('/', protect, async (req, res) => {
    const { name, amount, startDate, endDate } = req.body;
    const budget = await Budget.create({
        user: req.user._id, name, amount, startDate, endDate,
    });
    res.status(201).json(budget);
});

// GET /api/budgets (Mengambil semua budget)
router.get('/', protect, async (req, res) => {
    const budgets = await Budget.find({ user: req.user._id });
    const budgetDetails = await Promise.all(
        budgets.map(async (budget) => {
            const expenses = await Transaction.find({
                user: req.user._id, type: 'pengeluaran',
                createdAt: { $gte: budget.startDate, $lte: budget.endDate },
            });
            const spentAmount = expenses.reduce((acc, item) => acc + item.amount, 0);
            return {
                ...budget.toObject(),
                spent: spentAmount,
                remaining: budget.amount - spentAmount,
            };
        })
    );
    res.json(budgetDetails);
});

// @desc    Update sebuah budget
// @route   PUT /api/budgets/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const budget = await Budget.findById(req.params.id);

    if (budget && budget.user.toString() === req.user.id) {
        budget.name = req.body.name || budget.name;
        budget.amount = req.body.amount || budget.amount;
        budget.startDate = req.body.startDate || budget.startDate;
        budget.endDate = req.body.endDate || budget.endDate;

        const updatedBudget = await budget.save();
        res.json(updatedBudget);
    } else {
        res.status(404).json({ message: 'Budget tidak ditemukan atau user tidak berwenang' });
    }
});

// @desc    Hapus sebuah budget
// @route   DELETE /api/budgets/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    const budget = await Budget.findById(req.params.id);

    if (budget && budget.user.toString() === req.user.id) {
        await budget.deleteOne();
        res.json({ message: 'Budget berhasil dihapus' });
    } else {
        res.status(404).json({ message: 'Budget tidak ditemukan atau user tidak berwenang' });
    }
});

module.exports = router;