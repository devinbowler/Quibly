import React, { useState, useEffect } from 'react';
import './VisionBoard.css';
import ProjectForm from '../components/ProjectForm';
import { FaEllipsisH, FaTrashAlt } from 'react-icons/fa';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTheme } from '../ThemeContext';
import {Navigate, useNavigate} from "react-router-dom";

function Visionboard() {
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { darkMode } = useTheme();
  

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://quantumix.onrender.com/api/projects', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setProjects(data);
        } else {
          console.error('Error fetching projects:', data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [user, navigate]);

  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(`https://quantumix.onrender.com/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        setProjects(projects.filter(project => project._id !== projectId));
      } else {
        // Handle errors
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };
  const addProject = (project) => {
    setProjects([...projects, project]);
    setShowProjectForm(false);
  };

  const updateProject = async (project) => {
    try {
        const response = await fetch(`https://quantumix.onrender.com/api/projects/${project._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}` // Assuming user has a token property
            },
            body: JSON.stringify(project)
        });
        console.log('Updating project', project);
        if (!response.ok) {
            throw new Error('Failed to update project');
        }
        // Update local state if needed
    } catch (error) {
        console.error('Error updating project:', error);
    }
};

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${month} . ${day} . ${year}`;
  };
  
  // Function to handle open button click
  const openProjectPage = (project) => {
    navigate('/app/project', { state: { project } });
  };
  

  return (
    <div className={`vision-board ${darkMode ? "dark-mode" : ""}`}>
      <h2 className="header">Visionboard</h2>
      <div className={`projects ${darkMode ? "dark-mode" : ""}`}>
        {projects.map((project, index) => (
          <div key={index} className={`project-card ${darkMode ? "dark-mode" : ""}`}>
            <div className="project-header">
              <h3>{project.title}</h3>
              <FaEllipsisH className="edit-icon" onClick={() => handleEditProject(project)} />
            </div>
            <p className='line'></p>
            <p className="desc">{project.description}</p>
            <div className={`project-footer ${darkMode ? "dark-mode" : ""}`}>
              <p className="date">{formatDate(project.dateCreated)}</p>
              <button onClick={() => openProjectPage(project)} className="open-project">Open</button>
          </div>
          </div>
        ))}
      </div>
      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          onAddProject={addProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
          closeForm={() => setShowProjectForm(false)}
          isEditing={!!editingProject}
        />
      )}
      <button className="add-button" onClick={() => {
        setShowProjectForm(true);
        setEditingProject(null);
      }}>
        +</button>
    </div>
  );
}

export default Visionboard;
