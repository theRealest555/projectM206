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
      const response = await axios.get(`http://localhost:3002/task/show/${id}`);
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
      await axios.post(`/tasks/comment/${id}`, { 
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
      await axios.post(`/task/upload/${id}`, formData, { 
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
        await axios.delete(`/task/comment/${id}/${commentId}`);
        await fetchTask();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleDeleteAttachment = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await axios.delete(`/task/attachment/${id}/${fileId}`);
        await fetchTask();
      } catch (error) {
        console.error('Error deleting attachment:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!task) {
    return <div>Task not found. <Link to="/tasks">Return to task list</Link></div>;
  }

  return (
    <div className="task-detail">
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <form onSubmit={handleCommentSubmit}>
        <textarea
          value={comment || ''} // Ensuring controlled component
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment here..."
        />
        <button type="submit" disabled={commentLoading}>Post Comment</button>
      </form>
      <form onSubmit={handleFileUpload}>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0] || null)} // Ensuring controlled component
        />
        <button type="submit" disabled={fileLoading}>Upload</button>
      </form>
    </div>
  );
};

export default TaskDetail;
