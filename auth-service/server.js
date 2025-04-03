require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoute');
const User = require('./models/User');
const Message = require('./models/Message');
const { socketAuthenticate } = require('./middlewares/socketAuth');
const AppError = require('./utils/AppError');

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
app.use(express.json({ limit: '10kb' }));

connectDB();
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true
  }
});

io.use(socketAuthenticate);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.username} (${socket.id})`);

  socket.broadcast.emit('user_joined', {
    username: socket.user.username,
    timestamp: new Date()
  });

  socket.on('load_messages', async (callback) => {
    try {
      const messages = await Message.find().sort({ timestamp: 1 }).limit(50).lean();
      callback(messages);
    } catch (err) {
      callback([]);
    }
  });

  socket.on('send_message', async ({ text, userId }, callback) => {
    try {
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new AppError('Invalid message content', 400);
      }

      const newMessage = await Message.create({
        username: socket.user.username,
        userId: socket.user.id,
        text: text.trim(),
        timestamp: new Date()
      });

      io.emit('receive_message', newMessage);
      callback({ status: 'success' });
    } catch (err) {
      callback({ status: 'error', message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user?.username || 'Unknown'} (${socket.id})`);
    if (socket.user?.username) {
      socket.broadcast.emit('user_left', {
        username: socket.user.username,
        timestamp: new Date()
      });
    }
  });

  socket.on('error', (err) => console.error('Socket error:', err));
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  server.close(() => process.exit(1));
});
