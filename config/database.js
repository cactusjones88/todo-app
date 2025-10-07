const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://todouser:todouser12345@cluster0.gp0cdcq.mongodb.net/todoapp?retryWrites=true&w=majority&appName=Cluster0');

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;