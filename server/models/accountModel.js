// server/models/accountModel.js
const mongoose = require('mongoose');

const accountSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: [true, 'Silakan masukkan nama akun'],
        },
        balance: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;