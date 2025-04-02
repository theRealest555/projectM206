import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const fetchTask = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/tasks/show/${id}`);
      setTask(response.data[0]);
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setCommentLoading(true);
    try {
      await axios.post(`/api/tasks/comment/${id}`, { 
        userId: "currentUserId", 
        comment,
        userName: "Current User" 
      });
      setComment('');
      await fetchTask();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setFileLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`/api/tasks/upload/${id}`, formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data' 
        } 
      });
      setFile(null);
      await fetchTask();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setFileLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await axios.delete(`/api/tasks/comment/${id}/${commentId}`);
        await fetchTask();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleDeleteAttachment = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await axios.delete(`/api/tasks/attachment/${id}/${fileId}`);
        await fetchTask();
      } catch (error) {
        console.error('Error deleting attachment:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="alert alert-danger">
        Task not found. <Link to="/tasks">Return to task list</Link>
      </div>
    );
  }

  return (
    <div className="task-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 text-gray-800 mb-0">
          <i className="bi bi-card-checklist me-2"></i>Task Details
        </h2>
        <div className="d-flex gap-2">
          <Link to={`/tasks/edit/${id}`} className="btn btn-primary">
            <i className="bi bi-pencil me-2"></i>Edit Task
          </Link>
          <Link to="/tasks" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back to List
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h5 className="m-0 font-weight-bold text-primary">{task.title}</h5>
            </div>
            <div className="card-body">
              <p className="lead">{task.description}</p>
              
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="text-muted">Details</h6>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="bi bi-calendar me-2 text-primary"></i>
                        <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-flag me-2 text-primary"></i>
                        <strong>Priority:</strong> 
                        <span className={`badge badge-priority-${task.priority} ms-2`}>
                          {task.priority}
                        </span>
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-check-circle me-2 text-primary"></i>
                        <strong>Status:</strong> 
                        <span className={`badge badge-status-${task.status.replace(/\s+/g, '').toLowerCase()} ms-2`}>
                          {task.status}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="text-muted">Assignment</h6>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="bi bi-person me-2 text-primary"></i>
                        <strong>Assigned To:</strong> User #{task.assignedTo}
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-folder me-2 text-primary"></i>
                        <strong>Project:</strong> {task.projectId ? `Project #${task.projectId}` : 'No project'}
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-clock me-2 text-primary"></i>
                        <strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h5 className="m-0 font-weight-bold text-primary">
                <i className="bi bi-chat-left-text me-2"></i>Comments
              </h5>
            </div>
            <div className="card-body">
              {task.comments && task.comments.length > 0 ? (
                <div className="mb-4">
                  {task.comments.map((comment, index) => (
                    <div key={index} className="card comment-card mb-3">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">{comment.userName || 'Anonymous'}</h6>
                          <div className="d-flex gap-2">
                            <small className="text-muted">
                              {new Date(comment.date).toLocaleString()}
                            </small>
                            <button 
                              onClick={() => handleDeleteComment(comment._id)}
                              className="btn btn-sm btn-link text-danger"
                              title="Delete comment"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                        <p className="mb-0">{comment.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="bi bi-chat-square-text" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2">No comments yet</p>
                </div>
              )}

              <form onSubmit={handleCommentSubmit} className="mt-4">
                <div className="mb-3">
                  <label className="form-label">Add Comment</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your comment here..."
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={commentLoading}
                >
                  {commentLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Posting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>Post Comment
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h5 className="m-0 font-weight-bold text-primary">
                <i className="bi bi-paperclip me-2"></i>Attachments
              </h5>
            </div>
            <div className="card-body">
              {task.attachments && task.attachments.length > 0 ? (
                <div className="mb-4">
                  {task.attachments.map((file, index) => (
                    <div key={index} className="card mb-2">
                      <div className="card-body p-3 d-flex justify-content-between align-items-center">
                        <div>
                          <a 
                            href={file.fileUrl} 
                            download 
                            className="text-decoration-none"
                          >
                            <i className="bi bi-file-earmark me-2"></i>
                            {file.filename}
                          </a>
                          <small className="d-block text-muted">
                            {new Date(file.uploadedAt).toLocaleString()}
                          </small>
                        </div>
                        <button 
                          onClick={() => handleDeleteAttachment(file._id)}
                          className="btn btn-sm btn-link text-danger"
                          title="Delete attachment"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="bi bi-folder-x" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2">No attachments yet</p>
                </div>
              )}

              <form onSubmit={handleFileUpload} className="mt-4">
                <div className="mb-3">
                  <label className="form-label">Upload File</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={fileLoading}
                >
                  {fileLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-2"></i>Upload
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow">
            <div className="card-header py-3">
              <h5 className="m-0 font-weight-bold text-primary">
                <i className="bi bi-clock-history me-2"></i>Activity
              </h5>
            </div>
            <div className="card-body">
              {task.activityLog && task.activityLog.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {task.activityLog.map((activity, index) => (
                    <li key={index} className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex">
                        <div className="flex-shrink-0">
                          <i className="bi bi-circle-fill text-primary" style={{ fontSize: '0.5rem' }}></i>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <small className="text-muted d-block">
                            {new Date(activity.timestamp).toLocaleString()}
                          </small>
                          <small>{activity.message}</small>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="bi bi-clock-history" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2">No activity yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;