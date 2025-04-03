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
  const [error, setError] = useState(null);

  const fetchTask = async () => {
    try {
      const response = await axios.get(`http://localhost:3002/task/show/${id}`);
      setTask(response.data[0]);
      setError(null);
    } catch (error) {
      console.error('Error fetching task:', error);
      setError('Failed to load task details');
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
      await axios.post(`http://localhost:3002/task/comment/${id}`, { 
        userId: "currentUserId", 
        comment,
        userName: "Current User" 
      });
      setComment('');
      await fetchTask();
      setError(null);
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Failed to post comment');
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
      await axios.post(`http://localhost:3002/task/upload/${id}`, formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data' 
        } 
      });
      setFile(null);
      await fetchTask();
      setError(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file');
    } finally {
      setFileLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await axios.delete(`http://localhost:3002/task/comment/${id}/${commentId}`);
        await fetchTask();
        setError(null);
      } catch (error) {
        console.error('Error deleting comment:', error);
        setError('Failed to delete comment');
      }
    }
  };

  const handleDeleteAttachment = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await axios.delete(`http://localhost:3002/task/attachment/${id}/${fileId}`);
        await fetchTask();
        setError(null);
      } catch (error) {
        console.error('Error deleting attachment:', error);
        setError('Failed to delete attachment');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!task) {
    return <div className="error">Task not found. <Link to="/tasks">Return to task list</Link></div>;
  }

  return (
    <div className="task-detail">
      {error && <div className="error-message">{error}</div>}
      
      <div className="task-header">
        <h2>{task.title}</h2>
        <p className="task-description">{task.description}</p>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment here..."
            disabled={commentLoading}
          />
          <button type="submit" disabled={commentLoading}>
            {commentLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        <div className="comments-list">
          {task.comments?.map(comment => (
            <div key={comment.id} className="comment">
              <p className="comment-text">{comment.comment}</p>
              <p className="comment-meta">By {comment.userName} on {new Date(comment.createdAt).toLocaleString()}</p>
              <button 
                onClick={() => handleDeleteComment(comment.id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="attachments-section">
        <h3>Attachments</h3>
        <form onSubmit={handleFileUpload} className="upload-form">
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])}
            disabled={fileLoading}
          />
          <button type="submit" disabled={fileLoading}>
            {fileLoading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        <div className="attachments-list">
          {task.attachments?.map(attachment => (
            <div key={attachment.id} className="attachment">
              <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                {attachment.filename}
              </a>
              <button 
                onClick={() => handleDeleteAttachment(attachment.id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
