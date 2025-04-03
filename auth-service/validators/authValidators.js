const { body } = require('express-validator');
const User = require('../models/User');

exports.registerValidator = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail()
    .custom(async email => {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error('Email already in use');
      }
    }),
  
  body('username')
    .trim()
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .isLength({ max: 20 }).withMessage('Username cannot exceed 20 characters')
    .custom(async username => {
      const user = await User.findOne({ username });
      if (user) {
        throw new Error('Username already taken');
      }
    }),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain a number')
];

exports.loginValidator = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

exports.updateUserValidator = [
  body('email')
    .optional()
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (user && user._id.toString() !== req.params.id) {
        throw new Error('Email already in use');
      }
    }),
  
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .isLength({ max: 20 }).withMessage('Username cannot exceed 20 characters')
    .custom(async (username, { req }) => {
      const user = await User.findOne({ username });
      if (user && user._id.toString() !== req.params.id) {
        throw new Error('Username already taken');
      }
    }),
  
  body('role')
    .optional()
    .isIn(['admin', 'member', 'guest']).withMessage('Invalid role')
];