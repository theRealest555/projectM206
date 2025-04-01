import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleReset = () => {
    setSearchParams({
      name: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    onSearch({});
  };

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label small text-muted mb-0">Project Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search projects..." 
                name="name" 
                value={searchParams.name} 
                onChange={handleChange} 
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted mb-0">Start Date</label>
              <input 
                type="date" 
                className="form-control" 
                name="startDate" 
                value={searchParams.startDate} 
                onChange={handleChange} 
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted mb-0">End Date</label>
              <input 
                type="date" 
                className="form-control" 
                name="endDate" 
                value={searchParams.endDate} 
                onChange={handleChange} 
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted mb-0">Status</label>
              <select 
                className="form-select" 
                name="status" 
                value={searchParams.status} 
                onChange={handleChange}
              >
                <option value="">All Statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="on hold">On Hold</option>
              </select>
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-grow-1">
                <i className="bi bi-search me-2"></i>Search
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={handleReset}
                title="Reset"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;