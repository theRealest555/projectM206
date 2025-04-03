import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import './Chat.css'

const socket = io('http://localhost:3003')

const Chat = () => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (token) {
      socket.emit('authenticate', token)
    } else {
      setError('Vous devez être connecté pour rejoindre le chat')
    }

    socket.on('load_messages', (messages) => {
      setMessages(messages)
    })

    socket.on('receive_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data])
    })

    socket.on('user_joined', (message) => {
      setMessages((prevMessages) => [...prevMessages, { username: 'System', message }])
    })

    socket.on('user_left', (message) => {
      setMessages((prevMessages) => [...prevMessages, { username: 'System', message }])
    })

    socket.on('authentication_error', (errorMessage) => {
      setError(errorMessage)
    })

    return () => {
      socket.off('load_messages')
      socket.off('receive_message')
      socket.off('user_joined')
      socket.off('user_left')
      socket.off('authentication_error')
    }
  }, [token])

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', { message })
      setMessage('')
    }
  }

  return (
    <div className="chat-container">
      <h1>Chat en temps réel</h1>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="chat-window">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className="message">
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <div className="message-input">
            <input
              type="text"
              placeholder="Tapez votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Envoyer</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat