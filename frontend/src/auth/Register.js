import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !username || !password) {
      setError('Tous les champs sont requis.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Veuillez entrer un email valide.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      console.log('Form data:', { email, username, password });
      const response = await axios.post(`http://localhost:3003/register`, { email, username, password });
      console.log('Registration successful:', response.data);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please check your network or try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Inscription</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nom d'utilisateur:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mot de passe:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">S'inscrire</button>
      </form>
      <p>
        Déjà un compte ? <Link to="/">Se connecter</Link>
      </p>
    </div>
  );
};

export default Register;