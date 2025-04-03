import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { FiSend, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    socketRef.current = io(process.env.REACT_APP_WS_URL || 'http://localhost:3003', {
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });

    const socket = socketRef.current;

    const handleConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
      socket.emit('authenticate', { token: localStorage.getItem('token') });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setError('Disconnected from server. Reconnecting...');
    };

    const handleConnectError = (err) => {
      setIsConnecting(false);
      setError(`Connection failed: ${err.message}`);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));

    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [navigate, user]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected && socketRef.current) {
      socketRef.current.emit('send_message', {
        text: message.trim(),
        userId: user._id
      });
      setMessage('');
    }
  };

  if (!user) return null;

  return (
    <Container className="py-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Live Chat</h4>
          <div>
            {isConnecting ? (
              <Spinner animation="border" size="sm" variant="primary" />
            ) : (
              <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            )}
          </div>
        </Card.Header>
        
        <Card.Body>
          {error && (
            <Alert variant="danger" className="d-flex align-items-center">
              <FiAlertCircle className="me-2" />
              {error}
            </Alert>
          )}

          <ListGroup className="mb-3 chat-messages">
            {messages.map((msg, i) => (
              <ListGroup.Item key={i} className="message">
                <strong>{msg.username || 'Anonymous'}:</strong> {msg.text}
                <div className="text-muted small">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>

          <Form onSubmit={sendMessage}>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={!isConnected}
              />
              <Button 
                variant="primary" 
                type="submit"
                disabled={!message.trim() || !isConnected}
              >
                <FiSend className="me-1" /> Send
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Chat;
