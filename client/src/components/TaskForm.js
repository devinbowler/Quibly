import React, { useState } from 'react';
import Draggable from 'react-draggable';
import './taskForm.css';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTheme } from '../ThemeContext';

const TaskForm = ({ task, onAddTask, onUpdateTask, onDeleteTask, closeForm, isEditing }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.desc || '');
  const [tags, setTags] = useState(Array.isArray(task?.tags) ? task.tags : []);
  const [dueTime, setDueTime] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().substring(0, 16) : '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useAuthContext();
  const { darkMode } = useTheme();

  const handleTagChange = (index, event) => {
    const newTags = [...tags];
    newTags[index][event.target.name] = event.target.value;
    setTags(newTags);
  };

  const addTag = () => {
    setTags([...tags, { name: '', color: '#000000' }]);
  };

  const removeTag = index => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const handleDelete = async () => {
    if (!user || !task) return;

    console.log('deleting')

    const response = await fetch(`https://quantumix.onrender.com/api/tasks/${task._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });

    if (response.ok) {
      onDeleteTask(task._id); // Update parent state
      closeForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error('You must be logged in');
      return;
    }

    const selectedDate = new Date(dueTime);
    const now = new Date();
    const secondsLeft = Math.floor((selectedDate - now) / 1000);
    const dueDate = selectedDate.toISOString();

    if (isNaN(secondsLeft) || secondsLeft <= 0) {
      console.error('Invalid secondsLeft value');
      alert('Please enter a valid future date and time.');
      return;
    }

    const newTask = {
      title,
      desc: description,
      timer: `${dueTime}:00`,
      dueDate,
      paused: task?.paused || false,
      pauseStartTime: task?.pauseStartTime || null,
      secondsLeft,
      user_id: user.id,
      tags
    };

    try {
      const apiUrl = `https://quantumix.onrender.com/api/tasks${isEditing ? `/${task._id}` : ''}`;
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });

      const responseData = await response.json();

      if (response.ok) {
        isEditing ? onUpdateTask(responseData) : onAddTask(responseData);
        closeForm();
        console.log(responseData);
      } else {
        console.error('Failed to create or update task:', responseData);
        alert('Failed to create or update task. Please try again.');
      }
    } catch (err) {
      console.error('An error occurred:', err);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <Draggable handle=".task-form-header">
    <div className={`task-form-container ${darkMode ? 'dark-task-container' : ''}`}>
      <div className={`task-form ${darkMode ? 'dark-task-form' : ''}`}>
        <div className={`task-form-header ${darkMode ? 'dark-task-form-header' : ''}`}>
          <button className="close-button" onClick={closeForm}>X</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />
          <label htmlFor="dueTime">Due Date</label>
          <input
            type="datetime-local"
            id="dueTime"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            required
          />
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <div className="tags-section">
            {Array.isArray(tags) && tags.map((tag, index) => (
              <div key={index} className="tag">
                <input 
                  type="text" 
                  name="name" 
                  value={tag.name} 
                  onChange={(e) => handleTagChange(index, e)} 
                  placeholder="Tag Name" 
                />
                <input 
                  type="color" 
                  name="color" 
                  value={tag.color} 
                  onChange={(e) => handleTagChange(index, e)} 
                />
                <button type="button" onClick={() => removeTag(index)}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={addTag}>Add Tag</button>
          </div>
          <div className="form-buttons">
            <button type="submit" className={`button ${isEditing ? "rounded-left" : "rounded-full"}`}>
                {isEditing ? "Update Task" : "Create Task"}
            </button>
            {isEditing && (
                <button type="button" className="delete-button rounded-right" onClick={() => setShowDeleteModal(true)}>
                Delete Task
                </button>
            )}
            </div>
        </form>
      </div>
  
      {showDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h2>Are you sure you want to delete this task?</h2>
            <div className="delete-modal-buttons">
              <button onClick={handleDelete}>Yes</button>
              <button onClick={() => setShowDeleteModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Draggable>
  );
};

export default TaskForm;
