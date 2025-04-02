import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'ongoing',
    category: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/project/show/${id}`);
          const project = response.data;
          
          setFormData({
            ...project,
            startDate: project.startDate ? project.startDate.split('T')[0] : '',
            endDate: project.endDate ? project.endDate.split('T')[0] : ''
          });
        } catch (error) {
          console.error('Error fetching project:', error);
        }
      };
      fetchProject();
    }
  }, [id]);  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await axios.put(`http://localhost:3001/project/update/${id}`, formData);
      } else {
        await axios.post('http://localhost:3001/project/add', formData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="card shadow">
      <div className="card-header py-3">
        <h5 className="m-0 font-weight-bold text-primary">
          <i className={`bi bi-${id ? 'pencil' : 'plus'}-square me-2`}></i>
          {id ? 'Edit' : 'Add'} Project
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input 
              type="text" 
              className="form-control" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              name="description" 
              rows="3"
              value={formData.description} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Start Date</label>
              <input 
                type="date" 
                className="form-control" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">End Date</label>
              <input 
                type="date" 
                className="form-control" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select 
                className="form-select" 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="on hold">On Hold</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Category</label>
              <input 
                type="text" 
                className="form-control" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/')}
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
                  {id ? 'Update' : 'Create'} Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;