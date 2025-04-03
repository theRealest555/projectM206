const mongoose = require('mongoose');
require('dotenv').config()

const connectDB = async () => {
  mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('Connected to MongoDB'))
      .catch(err => console.error('MongoDB connection error:', err));
};

module.exports = connectDB;