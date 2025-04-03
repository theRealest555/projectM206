const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    index: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    unique: true,
    index: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: { 
    type: String, 
    enum: ['admin', 'member', 'guest'], 
    default: 'member' 
  },
  isBlocked: { 
    type: Boolean, 
    default: false 
  },
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);