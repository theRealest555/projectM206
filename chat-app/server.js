require('dotenv').config()  
const express = require('express')  
const http = require('http')  
const { Server } = require('socket.io')  
const mongoose = require('mongoose')  
const User = require('./models/User')  

const app = express()  
const server = http.createServer(app)  
const io = new Server(server, {  
  cors: {  
    origin: 'http://localhost:3000',  
    methods: ['GET', 'POST']  
  }  
})  

mongoose.connect(process.env.MONGO_URI, {  
  useNewUrlParser: true,  
  useUnifiedTopology: true  
})  
  .then(() => console.log('Connecté à MongoDB'))  
  .catch(err => console.error('Erreur de connexion à MongoDB:', err))  

const MessageSchema = new mongoose.Schema({  
  username: String,  
  message: String,  
  timestamp: { type: Date, default: Date.now }  
})  

const Message = mongoose.model('Message', MessageSchema)  

const saveMessage = async (username, message) => {  
  const newMessage = new Message({ username, message })  
  await newMessage.save()  
}  

const getMessages = async () => {  
  return await Message.find().sort({ timestamp: 1 })  
}  

io.on('connection', async (socket) => {  
  console.log('Un utilisateur s\'est connecté:', socket.id)  

  socket.on('set_username', async (username) => {  
    const user = await User.findOne({ username })  
    if (user) {  
      socket.username = user.username  
      console.log(`${user.username} a rejoint le chat.`)  
      io.emit('user_joined', `${user.username} a rejoint le chat.`)  

      const messages = await getMessages()  
      socket.emit('load_messages', messages)  
    } else {  
      console.log(`Utilisateur ${username} non trouvé.`)  
      socket.emit('username_error', 'Utilisateur non trouvé')  
    }  
  })  

  socket.on('send_message', async (data) => {  
    if (socket.username) {  
      console.log('Message reçu:', data)  
      await saveMessage(socket.username, data.message)  
      io.emit('receive_message', { username: socket.username, message: data.message })  
    }  
  })  

  socket.on('disconnect', () => {  
    if (socket.username) {  
      console.log(`${socket.username} s'est déconnecté.`)  
      io.emit('user_left', `${socket.username} a quitté le chat.`)  
    }  
  })  
})  

const PORT = process.env.PORT || 5000  
server.listen(PORT, () => {  
  console.log(`Serveur en écoute sur le port ${PORT}`)  
})  
