const mongoose = require('mongoose');

const budgetSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: [true, 'Silakan masukkan nama budget'],
        },
        amount: {
            type: Number,
            required: [true, 'Silakan masukkan jumlah budget'],
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;    