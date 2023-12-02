import { useTheme } from '../ThemeContext';
import { FaEllipsisH } from 'react-icons/fa'; // Import icon for edit button
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { FaPlay, FaPause, FaStopwatch, FaCalendarAlt } from 'react-icons/fa'; // Import play and pause icons
import TaskForm from '../components/TaskForm';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './Tasks.css';

  
  const Task = () => {
    const [tasks, setTasks] = useState({ inProgress: [], working: [], completed: [] });
    const [showForm, setShowForm] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const { user } = useAuthContext()
    const { darkMode } = useTheme();

    const handleEditTask = (task) => {
      setEditingTask(task);
      setShowForm(true);
    };    

    const formatTime = (totalSeconds) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

    const getDueDateText = (dueDate) => {
      const today = new Date();
      const due = new Date(dueDate);
      return due.toDateString() === today.toDateString() ? 'Today' : due.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const togglePause = (task) => {
    const updatedTask = {
        ...task,
        paused: !task.paused
    };
    // Update task in local state
    setTasks((currentTasks) => {
        return {
            ...currentTasks,
            [task.status]: currentTasks[task.status].map(t => t._id === task._id ? updatedTask : t)
        };
    });
    updateTask(updatedTask);
};

    const updateTask = async (task) => {
      try {
          const response = await fetch(`https://quantumix.onrender.com/api/tasks/${task._id}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${user.token}` // Assuming user has a token property
              },
              body: JSON.stringify(task)
          });
          if (!response.ok) {
              throw new Error('Failed to update task');
          }
          // Update local state if needed
      } catch (error) {
          console.error('Error updating task:', error);
      }
  };

  const updateTaskInState = (updatedTask) => {
    setTasks((prevTasks) => {
      return {
        ...prevTasks,
        [updatedTask.status]: prevTasks[updatedTask.status].map(task =>
          task._id === updatedTask._id ? updatedTask : task
        )
      };
    });
  };

  const deleteTaskFromState = (taskId) => {
    setTasks((prevTasks) => {
      return Object.keys(prevTasks).reduce((acc, status) => {
        acc[status] = prevTasks[status].filter(task => task._id !== taskId);
        return acc;
      }, {});
    });
    setEditingTask(null); // Reset editingTask to null
  };
  


  useEffect(() => {
    const interval = setInterval(() => {
        setTasks((currentTasks) => {
            const updatedTasks = { ...currentTasks };
            Object.keys(updatedTasks).forEach(status => {
                updatedTasks[status] = updatedTasks[status].map(task => {
                    if (!task.paused && task.secondsLeft > 0) {
                        return { ...task, secondsLeft: task.secondsLeft - 1 };
                    }
                    return task;
                });
            });
            return updatedTasks;
        });
    }, 1000);
    return () => clearInterval(interval);
}, []);

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
            console.log("Response:", response);
    
            if (response.ok) {
    
              // Ensure each task has a 'tags' array
              const formattedTasks = {
                inProgress: json.inProgress ? json.inProgress.map(task => ({ ...task, tags: task.tags || [] })) : [],
                working: json.working ? json.working.map(task => ({ ...task, tags: task.tags || [] })) : [],
                completed: json.completed ? json.completed.map(task => ({ ...task, tags: task.tags || [] })) : []
              };

              setTasks(formattedTasks);
              console.log('Fetched tasks:', json); // Log to see the structure
            } else {
              console.error('Error fetching tasks:', json); // Error from server
            }
          } catch (error) {
            console.error('Error fetching tasks:', error); // Network or other errors
          }
        }
      };
    
      fetchTasks();
    }, [user]);

    const handleCloseForm = () => {
      setShowForm(false);
      setEditingTask(null); // Reset editingTask to null
    };

    const onDragStart = () => {
        setIsDragging(true);
      };
      
  
const onDragEnd = async (result) => {
    setIsDragging(false);
    if (!result.destination) {
        return; // If dropped outside the list
    }

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return; // No changes needed
    }

    const sourceList = tasks[source.droppableId];
    const destinationList = tasks[destination.droppableId];
    const task = sourceList[source.index];

    // Create new source and destination lists
    const newSourceList = Array.from(sourceList);
    newSourceList.splice(source.index, 1);
    const newDestinationList = Array.from(destinationList);
    newDestinationList.splice(destination.index, 0, task);

    // Set the updated lists to state
    setTasks({
        ...tasks,
        [source.droppableId]: newSourceList,
        [destination.droppableId]: newDestinationList,
    });

    // Update the task type in the backend
    await updateTaskType(task._id || task.id, destination.droppableId);
};

const updateTaskType = async (taskId, newStatus) => {
  try {
      const response = await fetch(`https://quantumix.onrender.com/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({ status: newStatus }), // Assuming 'status' is the field to update
      });

      if (!response.ok) {
          throw new Error('Failed to update task type');
      }

      const updatedTask = await response.json();
      console.log('Task updated:', updatedTask);
  } catch (error) {
      console.error('Error updating task type:', error);
  }
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
    <div className={`task-page ${darkMode ? "dark-mode" : ""}`}>
      <div className={`columns ${darkMode ? "dark-mode" : ""}`}>
        {Object.keys(tasks).map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
              ref={provided.innerRef}
              className={`column ${darkMode ? "dark-mode" : ""} ${isDragging ? 'draggingOver' : ''}`}
              {...provided.droppableProps}
            >
                <h2 className={`${darkMode ? "dark-mode-text" : ""}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="task-count">({tasks[status].length})</span>
                </h2>
                {tasks[status].map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={provided.draggableProps.style}
                        className={`task-card ${snapshot.isDragging ? 'dragging' : ''} ${darkMode ? "dark-mode-card" : ""}`}
                      >
                      <div className="task-header">
                        <h3>{task.title}</h3>
                        <FaEllipsisH className="edit-icon" onClick={() => handleEditTask(task)} />
                      </div>
                        <div className="task-timer">
                          <div className="timer">
                            <FaStopwatch className={`timer-icon ${darkMode ? "dark-mode" : ""}`} />
                            <div className={`time-left ${darkMode ? "dark-mode" : ""}`}>{formatTime(task.secondsLeft)}</div>
                            <button 
                              onClick={() => togglePause(task)} 
                              className={`pause-play-btn ${task.paused ? 'play' : 'pause'}`}
                            >
                              {task.paused ? <FaPlay /> : <FaPause />}
                            </button>
                          </div>
                          <div className="due-date">
                            <FaCalendarAlt className="due-date-icon" />
                            {getDueDateText(task.dueDate)}
                          </div>
                        </div>
                        <div className="task-tags">
                        {task.tags.map((tag, index) => (
                          <span key={index} style={{ backgroundColor: `${tag.color}4D`, color: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
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
        onClick={() => {
          setShowForm(true);
          setEditingTask(null); // Ensure editingTask is reset
        }}
      >
        +
      </button>
      {showForm && (
        <TaskForm 
      task={editingTask}
      onAddTask={addTask} 
      onUpdateTask={updateTaskInState} // Function to update task in state
      onDeleteTask={deleteTaskFromState} // Function to delete task from state
      closeForm={handleCloseForm} 
      isEditing={!!editingTask}
    />
  )}
    </div>
  </DragDropContext>
);
};

export default Task;
