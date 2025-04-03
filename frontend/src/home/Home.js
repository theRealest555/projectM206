import React from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Container className="py-5">
      <Card className="shadow">
        <Card.Body className="text-center">
          <h1 className="mb-4">Welcome to Project Manager</h1>
          <p className="lead mb-4">You are successfully logged in.</p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="primary" onClick={() => navigate('/projects')}>
              View Projects
            </Button>
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Home;