import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div>
      <h1>Bienvenue !</h1>
      <p>Vous êtes connecté.</p>
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
};

export default Home;