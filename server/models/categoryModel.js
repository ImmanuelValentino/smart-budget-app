const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    type: { // 'pemasukan' atau 'pengeluaran'
        type: String,
        required: true,
    },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;