const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Mencoba terhubung ke MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Terhubung: ${conn.connection.host}`);
    } catch (error) {
        console.error("!!! GAGAL TERHUBUNG KE MONGODB !!!");
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;