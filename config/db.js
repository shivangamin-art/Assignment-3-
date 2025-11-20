// Connection to MongoDB using Mongoose

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // helps load variables from .env

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // stop app if DB fails
  }
};

module.exports = connectDB;
