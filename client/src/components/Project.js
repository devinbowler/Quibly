import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuthContext } from '../hooks/useAuthContext';
import './Project.css';

function Project() {
  const location = useLocation();
  const project = location.state.project;
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [title, setTitle] = useState(project.title);
  const [text, setText] = useState('');

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleBack = () => {
    navigate('/app/visionboard');
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`https://quantumix.onrender.com/api/projects/${project._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, text }) // Update with title and text
      });
  
      if (response.ok) {
        console.log("Project updated successfully");
      } else {
        console.error("Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  return (
    <div className="project">
      <button className="back-button" onClick={handleBack}>
        <FiArrowLeft />
      </button>
      <div className="header">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="project-title"
          placeholder="Untitled"
        />
        <button onClick={handleSave} className="save-button">Save</button>
      </div>
      <hr />
      <textarea
        value={text}
        onChange={handleTextChange}
        className="project-text"
        placeholder="This project will..."
      />
    </div>
  );
}

export default Project;
