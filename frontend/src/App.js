import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProjectList from './components/projects/ProjectList';
import ProjectForm from './components/projects/ProjectForm';
import TaskList from './components/tasks/TaskList';
import TaskForm from './components/tasks/TaskForm';
import KanbanBoard from './components/tasks/KanbanBoard';
import TaskDetail from './components/tasks/TaskDetail';
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
        </div>
      </nav>

      <main className="container py-4">
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/projects/add" element={<ProjectForm />} />
          <Route path="/projects/edit/:id" element={<ProjectForm />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/add" element={<TaskForm />} />
          <Route path="/tasks/edit/:id" element={<TaskForm />} />
          <Route path="/tasks/kanban" element={<KanbanBoard />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
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