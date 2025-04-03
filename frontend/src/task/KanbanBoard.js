import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const KanbanBoard = () => {
  const [columns, setColumns] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKanban = async () => {
      try {
        const response = await axios.get('http://localhost:3002/tasks/kanban');
        setColumns({
          todo: response.data.todo,
          inProgress: response.data.inProgress,
          done: response.data.done
        });
      } catch (error) {
        console.error('Error fetching kanban data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchKanban();
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    
    try {
      await axios.put(`http://localhost:3002/tasks/update-status/${taskId}`, { status: newStatus });
      const updatedColumns = { ...columns };
      const task = updatedColumns[result.source.droppableId].find(t => t._id === taskId);
      updatedColumns[result.source.droppableId] = updatedColumns[result.source.droppableId].filter(t => t._id !== taskId);
      updatedColumns[newStatus].push({ ...task, status: newStatus });
      setColumns(updatedColumns);
    } catch (error) {
      console.error('Error updating task status:', error);
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
    <div className="kanban-board">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 text-gray-800 mb-0">
          <i className="bi bi-kanban me-2"></i>Kanban Board
        </h2>
        <Link to="/tasks" className="btn btn-outline-primary">
          <i className="bi bi-list-task me-2"></i>List View
        </Link>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="row">
          {Object.entries(columns).map(([columnId, tasks]) => (
            <div className="col-md-4" key={columnId}>
              <div className="card kanban-column shadow-sm">
                <div className={`card-header text-white ${
                  columnId === 'todo' ? 'bg-secondary' : 
                  columnId === 'inProgress' ? 'bg-primary' : 'bg-success'
                }`}>
                  <h5 className="mb-0 kanban-header">
                    {columnId === 'todo' ? 'To Do' : 
                     columnId === 'inProgress' ? 'In Progress' : 'Done'}
                    <span className="badge bg-white text-dark ms-2">{tasks.length}</span>
                  </h5>
                </div>
                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      className="card-body p-3"
                      style={{ minHeight: '500px' }}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="card task-card mb-3 shadow-sm"
                            >
                              <div className="card-body p-3">
                                <h6 className="card-title mb-1">{task.title}</h6>
                                <p className="card-text small text-muted mb-2">{task.description}</p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className={`badge badge-priority-${task.priority}`}>
                                    {task.priority}
                                  </span>
                                  <small className="text-muted">
                                    {new Date(task.deadline).toLocaleDateString()}
                                  </small>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;