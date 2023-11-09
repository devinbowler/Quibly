import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './Project.css';

function Project() {
  const location = useLocation();
  const project = location.state.project;
  const navigate = useNavigate();

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
