import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SearchBar from './SearchBar';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:3001/project/all');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearch = (searchParams) => {
    fetchProjects(searchParams);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`http://localhost:3001/project/delete/${id}`);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="project-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 text-gray-800 mb-0">
          <i className="bi bi-folder me-2"></i>All Projects
        </h2>
        <Link to="/projects/add" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>New Project
        </Link>
      </div>
      
      <SearchBar onSearch={handleSearch} />
      
      {projects.length === 0 ? (
        <div className="card shadow">
          <div className="card-body text-center py-5">
            <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">No Projects Found</h5>
            <p className="text-muted">Create your first project to get started</p>
            <Link to="/projects/add" className="btn btn-primary mt-2">
              <i className="bi bi-plus-lg me-2"></i>Add Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {projects.map(project => (
            <div key={project.id} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">
                      <Link to={`/projects/edit/${project.id}`} className="text-decoration-none">
                        {project.name}
                      </Link>
                    </h5>
                    <span className={`badge bg-${project.status === 'completed' ? 'success' : project.status === 'on hold' ? 'warning' : 'info'}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="card-text text-muted small">{project.description}</p>
                  <div className="border-top pt-3 mt-3">
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </small>
                      <small className="text-muted">
                        <i className="bi bi-tag me-1"></i>
                        {project.category}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent d-flex justify-content-end gap-2">
                  <Link 
                    to={`/projects/edit/${project.id}`} 
                    className="btn btn-sm btn-outline-primary"
                    title="Edit"
                  >
                    <i className="bi bi-pencil"></i>
                  </Link>
                  <button 
                    onClick={() => handleDelete(project.id)} 
                    className="btn btn-sm btn-outline-danger"
                    title="Delete"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;