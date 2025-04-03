const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'membre', 'invité'], default: 'membre' },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);