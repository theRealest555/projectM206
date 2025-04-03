import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FiHome, FiFolder, FiList, FiTrello, FiLogIn, FiUserPlus } from 'react-icons/fi';
import Login from './auth/Login';
import Register from './auth/Register';
import Home from './home/Home';
import Chat from './auth/Chat';
import ProjectList from './project/ProjectList';
import ProjectForm from './project/ProjectForm';
import TaskList from './task/TaskList';
import TaskForm from './task/TaskForm';
import KanbanBoard from './task/KanbanBoard';
import TaskDetail from './task/TaskDetail';
import StatsDashboard from './StatsDashboard';
import './App.css';

const Navigation = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  if (!token && location.pathname !== '/login' && location.pathname !== '/register') {
    return null;
  }

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <span className="fw-bold">Project Manager</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="d-flex align-items-center gap-1">
              <FiHome /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/projects" className="d-flex align-items-center gap-1">
              <FiFolder /> Projects
            </Nav.Link>
            <Nav.Link as={Link} to="/tasks" className="d-flex align-items-center gap-1">
              <FiList /> Tasks
            </Nav.Link>
            <Nav.Link as={Link} to="/tasks/kanban" className="d-flex align-items-center gap-1">
              <FiTrello /> Kanban
            </Nav.Link>
            <Nav.Link as={Link} to="/chat" className="d-flex align-items-center gap-1">
              Chat
            </Nav.Link>
          </Nav>
          <Nav>
            {token ? (
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="d-flex align-items-center gap-1">
                  <FiLogIn /> Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="d-flex align-items-center gap-1">
                  <FiUserPlus /> Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

function App() {
  return (
    <Router>
      <Navigation />
      <Container className="py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/add" element={<ProjectForm />} />
          <Route path="/projects/edit/:id" element={<ProjectForm />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/add" element={<TaskForm />} />
          <Route path="/tasks/edit/:id" element={<TaskForm />} />
          <Route path="/tasks/kanban" element={<KanbanBoard />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/stats" element={<StatsDashboard />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;