require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/database'); 
const authRoutes = require('./routes/auth'); 
const User = require('./models/User'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});


connectDB();


app.use(express.json());


app.use('/api/auth', authRoutes);


const MessageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', MessageSchema);


const saveMessage = async (username, message) => {
  const newMessage = new Message({ username, message });
  await newMessage.save();
};

const getMessages = async () => {
  return await Message.find().sort({ timestamp: 1 });
};

io.on('connection', async (socket) => {
  console.log('Un utilisateur s\'est connecté:', socket.id);

  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id); 

      if (user) {
        socket.username = user.username;
        console.log(`${user.username} a rejoint le chat.`);
        io.emit('user_joined', `${user.username} a rejoint le chat.`);

        const messages = await getMessages();
        socket.emit('load_messages', messages);
      } else {
        console.log('Utilisateur non trouvé.');
        socket.emit('authentication_error', 'Utilisateur non trouvé');
      }
    } catch (err) {
      console.error('Erreur d\'authentification:', err);
      socket.emit('authentication_error', 'Token invalide');
    }
  });

  socket.on('send_message', async (data) => {
    if (socket.username) {
      console.log('Message reçu:', data);
      await saveMessage(socket.username, data.message);
      io.emit('receive_message', { username: socket.username, message: data.message });
    }
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      console.log(`${socket.username} s'est déconnecté.`);
      io.emit('user_left', `${socket.username} a quitté le chat.`);
    }
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});