const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      throw new AppError('Authentication token missing', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isBlocked) {
      throw new AppError('Your account has been blocked', 403);
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 401));
  }
};