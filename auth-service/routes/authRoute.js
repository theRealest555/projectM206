const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');
const restrictTo = require('../middlewares/restrict');
require('dotenv').config();


router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/users', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/users/search', authMiddleware, restrictTo('admin'), async (req, res) => {
  const { name, email, role } = req.query;
  try {
    const filters = {};
    if (name) filters.username = new RegExp(name, 'i');
    if (email) filters.email = new RegExp(email, 'i');
    if (role) filters.role = role;
    const users = await User.find(filters).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


router.put('/users/:id', authMiddleware, restrictTo('admin'), async (req, res) => {
  const { email, username, role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { email, username, role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


router.delete('/users/:id', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


router.put('/users/:id/block', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User blocked', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


router.put('/users/:id/unblock', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User unblocked', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;