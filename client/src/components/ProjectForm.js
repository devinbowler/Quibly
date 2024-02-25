import React, { useState } from 'react';
import './ProjectForm.css';
import Draggable from 'react-draggable';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTheme } from '../ThemeContext';

const ProjectForm = ({ project, addProject, updateProject, deleteProject, closeForm, isEditing }) => {
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useAuthContext();
  const { darkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const projectData = {
      title,
      description,
      user_id: user.id, // Assuming user id is available in user context
    };

    try {
      const apiUrl = `https://quantumix.onrender.com/api/projects${isEditing ? `/${project._id}` : ''}`;
      const method = isEditing ? 'PATCH' : 'POST';
      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const responseData = await response.json();

      if (response.ok) {
        if (isEditing) {
          updateProject(responseData);
        } else {
          addProject(responseData);
        }
        closeForm();
      } else {
        // Handle errors
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle errors
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    try {
      const response = await fetch(`https://quantumix.onrender.com/api/projects/${project._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        deleteProject(project._id);
        closeForm();
      } else {
        // Handle errors
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      // Handle errors
    }
  };

  const confirmDeletion = () => {
    setShowDeleteModal(true);
  };

  const cancelDeletion = () => {
    setShowDeleteModal(false);
  };

  return (
    <Draggable handle=".project-form-header">
      <div className={`project-form-container ${darkMode ? 'dark-event-form' : ''}`}>
        <div className="project-form">
          <div className="project-form-header">
            <button className="close-button" onClick={closeForm}>X</button>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
            <div className="form-buttons">
              <button type="submit" className="save-button">
                {isEditing ? "Update Project" : "Create Project"}
              </button>
              {isEditing && (
                <button type="button" className="delete-button" onClick={() => setShowDeleteModal(true)}>
                  Delete Project
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

export default ProjectForm;
