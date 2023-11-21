import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext'; 
import { useTheme } from '../ThemeContext';
import { FaEllipsisH } from 'react-icons/fa'; // Import icon for edit button
import TaskForm from '../components/TaskForm'; // Assuming TaskForm is in the same directory
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './Tasks.css';

// Mock initial data
const initialTasks = {
    inProgress: [],
    working: [],
    completed: []
  };
  
  // A little function to help us with reordering the result
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };
  
  const Task = () => {
    const [tasks, setTasks] = useState({ inProgress: [], working: [], completed: [] });
    const [showForm, setShowForm] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const { user } = useAuthContext()

    useEffect(() => {
        const fetchTasks = async () => {
            if (user && user.token) {
              try {
                const response = await fetch('https://quantumix.onrender.com/api/tasks', {
                  headers: {
                    'Authorization': `Bearer ${user.token}`
                  }
                });
                const json = await response.json();
                if (response.ok) {
                    setTasks({
                      inProgress: json, // Put all tasks into 'inProgress' initially
                      working: [],
                      completed: []
                    });
                }
              } catch (error) {
                console.error('Error fetching tasks:', error);
              }
            }
          };
    
        fetchTasks();
      }, [user]);

    const handleCloseForm = () => {
        setShowForm(false);
    };

    const onDragStart = () => {
        setIsDragging(true);
      };
      
  
    const onDragEnd = (result) => {
        setIsDragging(false);
        if (!result.destination) {
          return; // If dropped outside the list
        }
      
        const { source, destination } = result;
      
        // If the item is dropped in the same place, do nothing
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
          return;
        }
      
        // Making a copy of the items before rearranging them
        const start = tasks[source.droppableId];
        const finish = tasks[destination.droppableId];
      
        // Moving within the same list
        if (source.droppableId === destination.droppableId) {
          const newTaskList = Array.from(start);
          const [removed] = newTaskList.splice(source.index, 1);
          newTaskList.splice(destination.index, 0, removed);
      
          const newState = {
            ...tasks,
            [source.droppableId]: newTaskList,
          };
      
          setTasks(newState);
          return;
        }
      
        // Moving from one list to another
        const startTaskList = Array.from(start);
        const [removed] = startTaskList.splice(source.index, 1);
        const finishTaskList = Array.from(finish);
        finishTaskList.splice(destination.index, 0, removed);
      
        const newState = {
          ...tasks,
          [source.droppableId]: startTaskList,
          [destination.droppableId]: finishTaskList,
        };
      
        setTasks(newState);
      };
      
      
  
  // Function to handle task addition (to be used with TaskForm component)
  const addTask = (newTask) => {
    setTasks(prevTasks => ({
        ...prevTasks,
        inProgress: [...prevTasks.inProgress, { ...newTask, id: newTask._id }]
    }));
    setShowForm(false); // Close form after adding task
};


return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
    <div className="task-page">
      <div className="columns">
        {Object.keys(tasks).map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                className={`column ${snapshot.isDraggingOver ? 'draggingOver' : ''}`}
                {...provided.droppableProps}
              >
                <h2>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="task-count">({(tasks[status] || []).length.toString().padStart(2, '0')})</span>
                </h2>
                {/* Render the placeholder at the top of each column */}
                {isDragging && <div className="placeholder" />}
                {(tasks[status] || []).map((task, index) => (
                        <Draggable key={task._id || task.id} draggableId={task._id || task.id} index={index}>
                            {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style}
                                className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                          <div className="task-header">
                            <h3>{task.title}</h3>
                            <FaEllipsisH className="edit-icon" onClick={() => {/* open edit form logic */}} />
                          </div>
                          <p className="task-time">Time left: {/* logic to calculate and display time left */}</p>
                          <p className="task-desc">{task.desc}</p>
                        </div>
                      )}
                    </Draggable>
))}
                {provided.placeholder}
                </div>
                )}
                </Droppable>
          ))}
        </div>
        <button
          className="add-task-btn"
          onClick={() => setShowForm(true)}
          style={{ position: 'fixed', bottom: '20px', right: '20px' }} // Inline style as a fallback
        >
          +
        </button>
        {showForm && <TaskForm onAddTask={addTask} closeForm={handleCloseForm} />}
      </div>
    </DragDropContext>
  );
};

export default Task;
