const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');
const restrictTo = require('../middlewares/restrict');
const { validationResult } = require('express-validator');
const { registerValidator, loginValidator, updateUserValidator } = require('../validators/authValidators');
require('dotenv').config();

router.post('/register', registerValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, username, password } = req.body;
  
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'User already exists',
        errors: [
          { 
            msg: existingUser.email === email ? 'Email already in use' : 'Username already taken',
            param: existingUser.email === email ? 'email' : 'username'
          }
        ]
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      email, 
      username, 
      password: hashedPassword 
    });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      message: 'User registered successfully',
      user: userResponse,
      token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.password = undefined;

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/users', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password -__v');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

router.get('/users/search', authMiddleware, restrictTo('admin'), async (req, res) => {
  const { name, email, role } = req.query;
  
  try {
    const filters = {};
    if (name) filters.username = new RegExp(name, 'i');
    if (email) filters.email = new RegExp(email, 'i');
    if (role) filters.role = role;

    const users = await User.find(filters).select('-password -__v');
    res.json(users);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

router.put('/users/:id', authMiddleware, restrictTo('admin'), updateUserValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

router.delete('/users/:id', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

router.put('/users/:id/block', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User blocked successfully', user });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Failed to block user' });
  }
});

router.put('/users/:id/unblock', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User unblocked successfully', user });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Failed to unblock user' });
  }
});

module.exports = router;