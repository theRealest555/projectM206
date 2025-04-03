import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProjectList from './project/ProjectList';
import ProjectForm from './project/ProjectForm';
import TaskList from './task/TaskList';
import TaskForm from './task/TaskForm';
import KanbanBoard from './task/KanbanBoard';
import TaskDetail from './task/TaskDetail';
import Login from './auth/Login';
import Register from './auth/Register';
import Home from './home/Home';
import './index.css';

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            <i className="bi bi-kanban me-2"></i>Project Manager
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  <i className="bi bi-folder me-1"></i> Projects
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/tasks">
                  <i className="bi bi-list-task me-1"></i> Tasks
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/tasks/kanban">
                  <i className="bi bi-kanban me-1"></i> Kanban
                </Link>
              </li>
            </ul>
          </div>
          <div className="d-flex">
            <Link className="btn btn-outline-light me-2" to="/login">
              <i className="bi bi-box-arrow-in-right me-1"></i> Login
            </Link>
            <Link className="btn btn-outline-light" to="/register">
              <i className="bi bi-person-plus me-1"></i> Register
            </Link>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/add" element={<ProjectForm />} />
          <Route path="/projects/edit/:id" element={<ProjectForm />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/add" element={<TaskForm />} />
          <Route path="/tasks/edit/:id" element={<TaskForm />} />
          <Route path="/tasks/kanban" element={<KanbanBoard />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <footer className="bg-light py-3 mt-5 border-top">
        <div className="container text-center text-muted">
          <small>Project Manager © {new Date().getFullYear()}</small>
        </div>
      </footer>
    </Router>
  );
}

export default App;