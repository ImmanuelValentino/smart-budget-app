const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Menghubungkan ke model User
        },
        account: { // <-- TAMBAHKAN FIELD INI
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Account',
        },
        type: { // 'pemasukan' atau 'pengeluaran'
            type: String,
            required: true,
        },
        category: { // 'Gaji', 'Makanan', 'Transportasi', dll.
            type: String,
            required: true,
        },
        amount: { // Jumlah uang
            type: Number,
            required: true,
        },
        description: { // Deskripsi/catatan
            type: String,
            required: false,
        },
        date: { // <-- TAMBAHKAN FIELD INI
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Otomatis menambah field createdAt dan updatedAt
    }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;