import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VisionBoard.css';
import AddButton from '../components/AddButton';
import Note from '../components/Note';

function Visionboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);

  const handleAddProject = () => {
    const newProject = {
      id: Math.random(),
      title: 'Untitled',
      notes: [],
    };
    setProjects([newProject, ...projects]);
  };

  const handleAddNote = () => {
    const newNote = {
      id: Math.random(),
      title: '',
      text: '',
    };
    setNotes([newNote, ...notes]);
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleProjectClick = (project) => {
    navigate(`/app/project/${project.id}`, { state: { project } });
  };
  

  return (
    <div className="vision-board">
      <h2 className="header">Visionboard</h2>
      <div className="projects">
        <AddButton onAddProject={handleAddProject} onAddNote={handleAddNote} />
        {projects.map((project) => (
          <div key={project.id} className="project-card" onClick={() => handleProjectClick(project)}>
            {project.title}
          </div>
        ))}
      </div>
      <div className="notes">
        {notes.map((note) => (
          <Note key={note.id} note={note} onDelete={handleDeleteNote} />
        ))}
      </div>
    </div>
  );
}

export default Visionboard;
