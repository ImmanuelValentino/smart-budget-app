const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Category = require('../models/categoryModel');

// Kategori default
const defaultCategories = {
    pengeluaran: ['Makanan', 'Transportasi', 'Tagihan', 'Hiburan', 'Belanja'],
    pemasukan: ['Gaji', 'Freelance', 'Hadiah', 'Investasi'],
};

// @desc    Mengambil semua kategori (default + buatan user)
// @route   GET /api/categories
// @access  Private
router.get('/', protect, async (req, res) => {
    const userCategories = await Category.find({ user: req.user._id });

    // Gabungkan kategori default dengan kategori buatan user tanpa duplikat
    const pengeluaran = [...new Set([...defaultCategories.pengeluaran, ...userCategories.filter(c => c.type === 'pengeluaran').map(c => c.name)])];
    const pemasukan = [...new Set([...defaultCategories.pemasukan, ...userCategories.filter(c => c.type === 'pemasukan').map(c => c.name)])];

    res.json({ pengeluaran, pemasukan });
});

// @desc    Menambah kategori baru
// @route   POST /api/categories
// @access  Private
router.post('/', protect, async (req, res) => {
    const { name, type } = req.body;

    if (!name || !type) {
        return res.status(400).json({ message: 'Nama dan tipe kategori dibutuhkan' });
    }

    const newCategory = await Category.create({
        user: req.user._id,
        name,
        type,
    });

    res.status(201).json(newCategory);
});

module.exports = router;