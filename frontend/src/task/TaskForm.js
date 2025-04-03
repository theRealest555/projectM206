import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    assignedTo: '',
    status: 'to do',
    projectId: '' 
  });
  const [loading, setLoading] = useState(false);
  const [projectOptions, setProjectOptions] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:3001/project/all');
        setProjectOptions(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error.response?.data || error.message);
      }
    };

    // Fetch task if editing
    const fetchTask = async () => {
      try {
        const response = await axios.get(`http://localhost:3002/task/show/${id}`);
        setTask({
          ...response.data[0],
          deadline: response.data[0]?.deadline?.split('T')[0] || '',
          projectId: response.data[0]?.projectId || ''
        });
      } catch (error) {
        console.error('Error fetching task:', error.response?.data || error.message);
      }
    };

    fetchProjects();
    if (id) fetchTask();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await axios.put(`http://localhost:3002/task/update/${id}`, task);
      } else {
        await axios.post('http://localhost:3002/task/add', task);
      }
      navigate('/tasks');
    } catch (error) {
      console.error('Error saving task:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  return (
    <div className="card shadow">
      <div className="card-header py-3">
        <h5 className="m-0 font-weight-bold text-primary">
          <i className={`bi bi-${id ? 'pencil' : 'plus'}-square me-2`}></i>
          {id ? 'Edit' : 'Add'} Task
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-8">
              <label className="form-label">Title</label>
              <input 
                type="text" 
                className="form-control" 
                name="title" 
                value={task.title} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Project</label>
              <select 
                className="form-select" 
                name="projectId" 
                value={task.projectId} 
                onChange={handleChange}
                required
              >
                <option value="">Select Project</option>
                {projectOptions.length > 0 ? (
                  projectOptions.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))
                ) : (
                  <option value="" disabled>Loading projects...</option>
                )}
              </select>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              name="description" 
              rows="3"
              value={task.description} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Priority</label>
              <select 
                className="form-select" 
                name="priority" 
                value={task.priority} 
                onChange={handleChange}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select 
                className="form-select" 
                name="status" 
                value={task.status} 
                onChange={handleChange}
                required
              >
                <option value="to do">To Do</option>
                <option value="in progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Deadline</label>
              <input 
                type="date" 
                className="form-control" 
                name="deadline" 
                value={task.deadline} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Assigned To</label>
              <input 
                type="text" 
                className="form-control" 
                name="assignedTo" 
                value={task.assignedTo} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          
          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/tasks')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {id ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className={`bi bi-${id ? 'arrow-repeat' : 'save'} me-2`}></i>
                  {id ? 'Update' : 'Create'} Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
