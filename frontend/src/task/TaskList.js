import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:3002/tasks';

  useEffect(() => {
    let isMounted = true;
    
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/all`);
        if (isMounted) setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_BASE_URL}/delete/${id}`);
        setTasks((prevTasks) => prevTasks.filter(task => task.id !== id));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="task-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 text-gray-800 mb-0">
          <i className="bi bi-list-task me-2"></i>Task List
        </h2>
        <div className="d-flex gap-2">
          <Link to="/tasks/kanban" className="btn btn-outline-primary">
            <i className="bi bi-kanban me-2"></i>Kanban View
          </Link>
          <Link to="/tasks/add" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>New Task
          </Link>
        </div>
      </div>

      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search tasks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="card shadow">
          <div className="card-body text-center py-5">
            <i className="bi bi-list-check text-muted" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">No Tasks Found</h5>
            <p className="text-muted">
              {searchTerm ? 'Try a different search term' : 'Create your first task to get started'}
            </p>
            <Link to="/tasks/add" className="btn btn-primary mt-2">
              <i className="bi bi-plus-lg me-2"></i>Add Task
            </Link>
          </div>
        </div>
      ) : (
        <div className="card shadow">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Deadline</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => (
                    <tr key={task.id}>
                      <td>
                        <Link to={`/tasks/${task.id}`} className="text-decoration-none">
                          {task.title}
                        </Link>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '200px' }}>
                        {task.description}
                      </td>
                      <td>
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge badge-priority-${task.priority}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-status-${task.status.replace(/\s+/g, '').toLowerCase()}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link 
                            to={`/tasks/${task.id}`} 
                            className="btn btn-sm btn-info"
                            title="View"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link 
                            to={`/tasks/edit/${task.id}`} 
                            className="btn btn-sm btn-primary"
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button 
                            onClick={() => handleDelete(task.id)} 
                            className="btn btn-sm btn-danger"
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
