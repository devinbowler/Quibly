import React, { useState, useEffect, useCallback } from 'react';
import "./task.css";
import {
  fetchAllItems,
  createTask,
  createNote,
  createFolder,
  saveNote,
  deleteItem,
  fetchNoteDetails,
  updateTask // Ensure this function is defined in your api.js
} from '../api/api';
import { debounce } from 'lodash';
import { useLogout } from '../hooks/useLogout';
import { useNavigate } from 'react-router-dom';

function Task() {
  // State for settings modal
  const [showSettings, setShowSettings] = useState(false);

  // Get logout function and navigate hook so we can log out from here too.
  const { logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Other state variables
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [viewType, setViewType] = useState('task'); // 'task', 'note', 'code', 'grid', 'taskDetails'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState('system:/user/');
  const [selectedIndex, setSelectedIndex] = useState(null); // Changed from 0 to null for better handling
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', dueDate: '', details: '' });
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedNote, setSelectedNote] = useState({ _id: '', title: '', body: '' }); // Added _id for notes
  const [isSaving, setIsSaving] = useState(false); // For auto-saving
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null); // For displaying errors

  // Fetch all items (tasks, folders, notes) from the backend
  useEffect(() => {
    const loadItems = async () => {
      console.log('Fetching all items...');
      try {
        const data = await fetchAllItems();
        setTasks(data.tasks);
        
        // Add a type property to notes
        const notesWithType = data.notes.map(note => ({
          ...note,
          type: 'file'  // This distinguishes notes from folders
        }));
        
        // Combine folders and notes
        const combinedFiles = [...data.folders, ...notesWithType];
        setFiles(combinedFiles);
        setFilteredFiles(combinedFiles);
        console.log('Items loaded:', data);
      } catch (error) {
        console.error('Error loading items:', error);
        setErrorMessage('Failed to load items.');
      }
    };
    loadItems();
  }, []);

  // Set greeting and current date
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening');
    const now = new Date();
    setCurrentDate(`${now.toLocaleString('default', { month: 'long' })} ${now.getDate()}, ${now.getFullYear()}`);
  }, []);

  const debouncedSaveNote = useCallback(
    debounce(async (note) => {
      if (!note._id) return;
      setIsSaving(true);
      setSaveMessage("Saving...");
      try {
        await saveNote(note._id, {
          title: note.title,
          body: note.body,
        });
        console.log("Note auto-saved!");
        setErrorMessage(null);
        
        // Update the files list with the latest note data
        setFiles(prevFiles =>
          prevFiles.map(file =>
            file._id === note._id ? { ...file, title: note.title, body: note.body } : file
          )
        );
        setFilteredFiles(prevFiles =>
          prevFiles.map(file =>
            file._id === note._id ? { ...file, title: note.title, body: note.body } : file
          )
        );
        
        // Display "Saved." for a short period after saving
        setTimeout(() => {
          setSaveMessage("Saved.");
        }, 1000);
      } catch (error) {
        console.error("Error auto-saving note:", error.response?.data?.error || error.message);
        setErrorMessage("Failed to auto-save note.");
        setSaveMessage("");
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  // Handle changes in note fields with auto-save
  const handleNoteChange = (field, value) => {
    const updatedNote = { ...selectedNote, [field]: value };
    setSelectedNote(updatedNote);
    debouncedSaveNote(updatedNote);
  };

  // Navigate into a folder
  const navigateIntoFolder = (folderName) => {
    console.log('Navigating into folder:', folderName);
    setCurrentPath(`${currentPath}${currentPath.endsWith('/') ? '' : '/'}${folderName}`);
    setSelectedIndex(null);
  };

  // Handle clicking on a file (folder or note)
  const handleFileClick = async (file) => {
    if (file.type === 'folder') {
      console.log('Folder clicked:', file.name);
      navigateIntoFolder(file.name);
    } else if (file.type === 'file') { // For notes
      console.log('File clicked:', file.title);
      try {
        const note = await fetchNoteDetails(file._id);
        console.log('Note loaded:', note);
        setSelectedNote(note);
        setViewType('note');
        setErrorMessage(null);
      } catch (error) {
        console.error('Error loading note:', error);
        setErrorMessage('Failed to load note.');
      }
    }
  };

  // Handle creating a new folder or note
  const handleCreate = async (type) => {
    console.log(`Creating a new ${type}...`);
    if (type === 'folder') {
      const newItem = { name: "New Folder", parentFolder: currentPath };
      try {
        const createdFolder = await createFolder(newItem);
        console.log('Folder created:', createdFolder);
        setFiles([...files, createdFolder]);
        setFilteredFiles([...filteredFiles, createdFolder]);
      } catch (error) {
        console.error(`Error creating folder:`, error);
        setErrorMessage(`Failed to create ${type}.`);
      }
    } else { // for note creation (type === 'file')
      const newItem = { title: "New Note", body: "", parentFolder: currentPath, type: "file" };
      try {
        const createdNote = await createNote(newItem);
        // Patch the returned note with a type property
        createdNote.type = "file";
        console.log('Note created:', createdNote);
        
        // Add the note to the files list so it shows in the UI
        setFiles(prevFiles => [...prevFiles, createdNote]);
        setFilteredFiles(prevFiles => [...prevFiles, createdNote]);
        
        setSelectedNote(createdNote);
        setViewType('note');
        setErrorMessage(null);
      } catch (error) {
        console.error(`Error creating note:`, error);
        setErrorMessage(`Failed to create note.`);
      }
    }
  };

  // Handle creating a new task
  const handleCreateTask = async () => {
    const newTaskData = {
      title: newTask.name,
      details: newTask.details,
      dueDate: newTask.dueDate,
      parentFolder: currentPath,
    };
    
    console.log('Creating task with data:', newTaskData);
    
    try {
      const createdTask = await createTask(newTaskData);
      console.log('Task created:', createdTask);
      setTasks([...tasks, createdTask]);
      setIsAddingTask(false);
      setIsEditingTask(false);
      setNewTask({ name: '', dueDate: '', details: '' });
      setErrorMessage(null);
    } catch (error) {
      console.error('Error creating task:', error);
      setErrorMessage('Failed to create task.');
    }
  };

  // Handle updating a task
  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    console.log('Updating task:', selectedTask);
    try {
      const updatedTask = await updateTask(selectedTask._id, {
        title: selectedTask.title,
        dueDate: selectedTask.dueDate,
        details: selectedTask.details,
      });
      console.log('Task updated:', updatedTask);
      setTasks(tasks.map(task => task._id === updatedTask._id ? updatedTask : task));
      setSelectedTask(null);
      setViewType('task');
      setErrorMessage(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setErrorMessage('Failed to update task.');
    }
  };

  // Handle deleting a task or note
  const handleDelete = async () => {
    console.log('Deleting item...');
    const itemToDelete = viewType === 'taskDetails' ? selectedTask : selectedNote;
    const itemType = viewType === 'taskDetails' ? 'task' : 'note';
    try {
      await deleteItem(itemToDelete._id, itemType);
      console.log('Item deleted:', itemToDelete);
      if (viewType === 'taskDetails') {
        setTasks(tasks.filter(task => task._id !== selectedTask._id));
        setSelectedTask(null);
        setViewType('task');
      } else {
        setFiles(prevFiles => prevFiles.filter(file => file._id !== selectedNote._id));
        setFilteredFiles(prevFiles => prevFiles.filter(file => file._id !== selectedNote._id));
        setSelectedNote(null);
        setViewType('grid');
      }
      setErrorMessage(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setErrorMessage(`Failed to delete ${itemType}.`);
    }
  };

  // Open modal to add a new task
  const openAddTaskModal = () => {
    console.log('Opening task modal...');
    setIsAddingTask(true);
  };

  // Open modal to view/edit task details
  const openTaskDetailsModal = (task) => {
    console.log('Opening task details modal for task:', task);
    setSelectedTask(task);
    setViewType('taskDetails');
  };

  const handleEditTask = () => {
    setIsEditingTask(true);
  };

  // Handle textarea formatting for bullet points
  const handleTextareaFormatting = (e) => {
    const value = e.target.value;
    const lastTwoChars = value.slice(-2);
    if (lastTwoChars === "* ") {
      console.log('Formatting bullet point...');
      e.target.value = value.slice(0, -2) + "• ";
    }
  };

  // Handle navigating back in the folder path
  const handlePathBackspace = () => {
    console.log('Backspacing through path:', currentPath);
    let newPath = currentPath.replace(/\/[^/]+\/?$/, '');
    if (newPath === 'system:/user' || newPath === 'system:/user/') {
      setCurrentPath('system:/user/');
    } else {
      setCurrentPath(newPath);
    }
  };

  // Handle keydown events for shortcuts and navigation
  const handleKeyDown = (e) => {
    const searchInput = document.getElementById('search-input');
    if (e.key === 'Escape' && (isAddingTask || selectedTask)) {
      setIsAddingTask(false);
      setSelectedTask(null);
      setViewType('task');
      setErrorMessage(null);
    } else if (e.key === 'Escape' && searchInput === document.activeElement) {
      e.preventDefault();
      searchInput.blur();
    }
    if (e.key === 'Backspace' && !searchQuery && currentPath !== 'system:/user/') {
      e.preventDefault();
      handlePathBackspace();
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote?._id) {
      alert("Note has not been saved yet.");
      return;
    }
    try {
      const savedNote = await saveNote(selectedNote._id, {
        title: selectedNote.title,
        body: selectedNote.body,
      });
      console.log("Note saved manually:", savedNote);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error saving note:", error);
      setErrorMessage("Failed to save note.");
    }
  };

  // Attach keydown event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddingTask, selectedTask, currentPath, searchQuery]);

  return (
    <div className="app-container">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="left-content">
          <span className="greeting">{greeting}</span>
          <span className="statistics-date">{currentDate}</span>
        </div>
        {/* Clicking the gear now toggles the settings modal */}
        <span className="settings-gear" onClick={() => setShowSettings(true)}>
          ⚙️
        </span>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay settings-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <div className="left-buttons">
          {viewType !== 'note' && (
            <>
              <button
                onClick={() => setViewType('task')}
                className={viewType === 'task' ? 'active' : ''}
              >
                <i className="fas fa-tasks"></i>
              </button>
            </>
          )}
          {viewType !== 'note' && (
            <>
              <button
                onClick={() => setViewType('code')}
                className={viewType === 'code' ? 'active' : ''}
              >
                <i className="fas fa-code"></i>
              </button>
              <button
                onClick={() => setViewType('grid')}
                className={viewType === 'grid' ? 'active' : ''}
              >
                <i className="fas fa-th-large"></i>
              </button>
            </>
          )}
        </div>
        <div className="right-buttons">
          {viewType === 'task' ? (
            <button onClick={openAddTaskModal}>Add Task</button>
          ) : viewType === 'note' ? (
            <></>
          ) : (
            <>
              <button onClick={() => handleCreate('folder')}>Add Folder</button>
              <button onClick={() => handleCreate('file')}>Add Note</button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {viewType !== 'task' && viewType !== 'note' && viewType !== 'taskDetails' && (
        <div className="search-bar">
          <span className="find-file">Find file:</span>
          <span className={`path ${selectedIndex !== null ? 'path-active' : ''}`}>
            {`~${currentPath}`}
          </span>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Error Message */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Task View */}
      {viewType === 'task' && (
        <div className="file-system-viewer">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`file-item task-item ${selectedTask?._id === task._id ? 'selected' : ''}`}
              onClick={() => openTaskDetailsModal(task)}
            >
              <span className="task-title">{task.title}</span>
              <span className="task-details">
                {task.details && task.details.length > 100
                  ? task.details.slice(0, 100) + '...'
                  : task.details}
              </span>
              <span className="task-due">
                {new Date(task.dueDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Code View and Grid View */}
      {(viewType === 'code' || viewType === 'grid') && (
        <div className={viewType === 'code' ? "file-system-viewer" : "grid-view"}>
          {files
            .filter(file => file.parentFolder === currentPath)
            .map((file) => (
              <div
                key={file._id}
                className={`${viewType === 'code' ? 'file-item' : 'grid-item'} ${file.type} ${selectedIndex === file._id ? 'selected' : ''}`}
                onClick={() => handleFileClick(file)}
              >
                {viewType === 'code' ? (
                  <>
                    <span className="file-name">
                      {file.type === 'folder' ? file.name : file.title}
                    </span>
                    <span className="last-accessed">
                      {file.lastAccessed
                        ? new Date(file.lastAccessed).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </span>
                  </>
                ) : (
                  <>
                    <i className={`fas ${file.type === 'folder' ? 'fa-folder' : 'fa-file'}`}></i>
                    <span className="file-name">
                      {file.type === 'folder' ? file.name : file.title}
                    </span>
                  </>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Note View */}
      {viewType === 'note' && selectedNote && (
        <div className="note-view">
          <div className="note-view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="back-button" onClick={() => setViewType('code')}>
              ← Back
            </button>
            <div className="note-status-controls" style={{ display: 'flex', alignItems: 'center' }}>
              {saveMessage && <span className="save-status" style={{ marginRight: '1rem' }}>{saveMessage}</span>}
              <button onClick={handleDelete} className="delete-button">
                Delete
              </button>
            </div>
          </div>
          <input
            className="note-title"
            placeholder="Enter note title..."
            value={selectedNote.title}
            onChange={(e) => handleNoteChange('title', e.target.value)}
          />
          <textarea
            placeholder="Details..."
            className="note-body"
            value={selectedNote.body}
            onChange={(e) => handleNoteChange('body', e.target.value)}
            onInput={handleTextareaFormatting}
          />
        </div>
      )}

      {/* Modal for Adding Task */}
      {isAddingTask && (
        <div className="modal-overlay">
          <div className="modal">
            <input
              className="modal-input"
              type="text"
              placeholder="Task Title"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            />
            <input
              className="modal-input"
              type="date"
              placeholder="Due Date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            <textarea
              className="modal-textarea"
              placeholder="Details"
              value={newTask.details}
              onChange={(e) => setNewTask({ ...newTask, details: e.target.value })}
            />
            <button className="create-button" onClick={handleCreateTask}>
              Create Task
            </button>
            <button className="close-button" onClick={() => setIsAddingTask(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Viewing a Task */}
      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-view">
            <textarea readOnly
              className="modal-title unselectable"
              type="text"
              value={selectedTask.title}
            />
            <textarea readOnly
              className="modal-date unselectable"
              value={
                selectedTask.dueDate
                  ? new Date(selectedTask.dueDate).toISOString().slice(0, 10)
                  : ''
              }
            />
            <textarea readOnly
              className="modal-details unselectable"
              value={selectedTask.details}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, details: e.target.value })
              }
              required
            />
            <div className="modal-buttons">
              <button className="update-button" onClick={handleEditTask}>
                Edit
              </button>
              <button
                className="close-button"
                onClick={() => {
                  setSelectedTask(null);
                  setViewType('task');
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editing a Task */}
      {selectedTask && isEditingTask && (
        <div className="modal-overlay">
          <div className="modal">
            <input
              className="modal-input"
              type="text"
              value={selectedTask.title}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, title: e.target.value })
              }
              required
            />
            <input
              className="modal-input"
              type="date"
              value={
                selectedTask.dueDate
                  ? new Date(selectedTask.dueDate).toISOString().slice(0, 10)
                  : ''
              }
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, dueDate: e.target.value })
              }
              required
            />
            <textarea
              className="modal-textarea"
              value={selectedTask.details}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, details: e.target.value })
              }
              required
            />
            <div className="modal-buttons">
              <button 
                className="update-button" 
                onClick={() => {
                  handleUpdateTask();
                  setIsEditingTask(false);
                }}>
                Update
              </button>
              <button
                className="close-button"
                onClick={() => {
                  setIsEditingTask(false);
                  setSelectedTask(null);
                  setViewType('task');
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Task;
