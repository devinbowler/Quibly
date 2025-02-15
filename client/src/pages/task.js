import React, { useState, useEffect, useCallback } from 'react';
import "./task.css";
import {
  fetchAllItems,
  createTask,
  createNote,
  createFolder,
  updateFolder,
  saveNote,
  deleteItem,
  fetchNoteDetails,
  updateTask
} from '../api/api';
import { debounce } from 'lodash';
import { useLogout } from '../hooks/useLogout';
import { useNavigate } from 'react-router-dom';
import { useUpdate } from '../hooks/useUpdate';

function Task() {
  // State for settings modal
  const [showSettings, setShowSettings] = useState(false);
  const { logout } = useLogout();
  const { update, error } = useUpdate();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Other state variables
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [viewType, setViewType] = useState('task'); // 'task', 'note', 'code', 'grid', 'taskDetails'
  const [noteBack, setNoteBack] = useState(''); 
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState('system:/user/');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', dueDate: '', details: '' });
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedNote, setSelectedNote] = useState({ _id: '', title: '', body: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // New state for folder modal (used for both adding and editing)
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState(""); // "add" or "edit"
  const [folderName, setFolderName] = useState("");

  // Function to load items from the backend
  const loadItems = async () => {
    try {
      const data = await fetchAllItems();
      setTasks(data.tasks);
      const notesWithType = data.notes.map(note => ({
        ...note,
        type: 'file'
      }));
      const combinedFiles = [...data.folders, ...notesWithType];
      setFiles(combinedFiles);
      setFilteredFiles(combinedFiles);
    } catch (error) {
      console.error('Error loading items:', error);
      setErrorMessage('Failed to load items.');
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Set greeting and current date
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening');
    const now = new Date();
    setCurrentDate(`${now.toLocaleString('default', { month: 'long' })} ${now.getDate()}, ${now.getFullYear()}`);
  }, []);

  // Determine the current folder object (if not at root)
  let currentFolderObj = null;
  if (currentPath !== "system:/user/") {
    const segments = currentPath.split('/').filter(s => s !== '');
    const currentFolderName = segments[segments.length - 1];
    currentFolderObj = files.find(file => file.type === 'folder' && file.name === currentFolderName);
  }

  // --- Folder Modal Functions ---
  const openFolderModal = (mode) => {
    setFolderModalMode(mode);
    if (mode === "edit" && currentFolderObj) {
      setFolderName(currentFolderObj.name);
    } else {
      setFolderName("");
    }
    setShowFolderModal(true);
  };

  const closeFolderModal = () => {
    setShowFolderModal(false);
    setFolderModalMode("");
    setFolderName("");
  };

  const handleSaveFolder = async () => {
    if (folderModalMode === "add") {
      // Create a new folder with the entered name
      try {
        const newFolder = await createFolder({ name: folderName, parentFolder: currentPath });
        setFiles([...files, newFolder]);
        setFilteredFiles([...filteredFiles, newFolder]);
        closeFolderModal();
      } catch (error) {
        alert("Failed to create folder.");
      }
    } else if (folderModalMode === "edit") {
      // Update the current folder's name
      try {
        const updatedFolder = await updateFolder(currentFolderObj._id, { name: folderName });
        // Update currentPath: replace the old folder name with the new name
        const segments = currentPath.split('/');
        segments[segments.length - 1] = folderName;
        const newPath = segments.join('/');
        setCurrentPath(newPath);
        // Refresh items list
        await loadItems();
        closeFolderModal();
      } catch (error) {
        alert("Failed to update folder.");
      }
    }
  };
  // --- End Folder Modal Functions ---

  // Delete folder (and all nested content)
  const handleDeleteFolder = async () => {
    if (!currentFolderObj) {
      alert("No folder to delete.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this folder and all its contents?")) {
      return;
    }
    try {
      await deleteItem(currentFolderObj._id, 'folder');
      let newPath = currentPath.replace(/\/[^/]+\/?$/, '');
      if (newPath === '' || newPath === 'system:/user') {
        newPath = 'system:/user/';
      }
      setCurrentPath(newPath);
      await loadItems();
    } catch (error) {
      alert("Failed to delete folder.");
    }
  };

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
        setErrorMessage(null);
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

  const handleNoteChange = (field, value) => {
    const updatedNote = { ...selectedNote, [field]: value };
    setSelectedNote(updatedNote);
    debouncedSaveNote(updatedNote);
  };

  const navigateIntoFolder = (folderName) => {
    setCurrentPath(`${currentPath}${currentPath.endsWith('/') ? '' : '/'}${folderName}`);
    setSelectedIndex(null);
  };

  const handleFileClick = async (file) => {
    if (file.type === 'folder') {
      navigateIntoFolder(file.name);
    } else if (file.type === 'file') {
      try {
        const note = await fetchNoteDetails(file._id);
        setSelectedNote(note);
        setViewType('note');
        setErrorMessage(null);
      } catch (error) {
        console.error('Error loading note:', error);
        setErrorMessage('Failed to load note.');
      }
    }
  };

  const handleCreate = async (type) => {
    if (type === 'folder') {
      // Instead of auto-creating a folder with default name, prompt for a name
      openFolderModal("add");
    } else {
      const newItem = { title: "New Note", body: "", parentFolder: currentPath, type: "file" };
      try {
        const createdNote = await createNote(newItem);
        createdNote.type = "file";
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

  const handleCreateTask = async () => {
    const newTaskData = {
      title: newTask.name,
      details: newTask.details,
      dueDate: newTask.dueDate,
      parentFolder: currentPath,
    };
    try {
      const createdTask = await createTask(newTaskData);
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

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    try {
      const updatedTask = await updateTask(selectedTask._id, {
        title: selectedTask.title,
        dueDate: selectedTask.dueDate,
        details: selectedTask.details,
      });
      setTasks(tasks.map(task => task._id === updatedTask._id ? updatedTask : task));
      setSelectedTask(null);
      setViewType('task');
      setErrorMessage(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setErrorMessage('Failed to update task.');
    }
  };

  const handleDelete = async () => {
    const itemToDelete = viewType === 'taskDetails' ? selectedTask : selectedNote;
    const itemType = viewType === 'taskDetails' ? 'task' : 'note';
    try {
      await deleteItem(itemToDelete._id, itemType);
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

  const openAddTaskModal = () => {
    setIsAddingTask(true);
  };

  const openTaskDetailsModal = (task) => {
    setSelectedTask(task);
    setViewType('taskDetails');
  };

  const handleEditTask = () => {
    setIsEditingTask(true);
  };

  const handleTextareaFormatting = (e) => {
    const value = e.target.value;
    const lastTwoChars = value.slice(-2);
    if (lastTwoChars === "* ") {
      e.target.value = value.slice(0, -2) + "• ";
    }
  };
  

  const handlePathBackspace = () => {
    let newPath = currentPath.replace(/\/[^/]+\/?$/, '');
    if (newPath === 'system:/user' || newPath === 'system:/user/') {
      setCurrentPath('system:/user/');
    } else {
      setCurrentPath(newPath);
    }
  };

  const handleKeyDown = (e) => {
    // If a modal (e.g. folder edit) is open, ignore global key events.
    if (showFolderModal) return;
  
    const activeEl = document.activeElement;
    const tag = activeEl ? activeEl.tagName.toUpperCase() : '';
  
    // Handle Escape key
    if (e.key === 'Escape') {
      if (isAddingTask || selectedTask) {
        setIsAddingTask(false);
        setSelectedTask(null);
        setViewType('task');
        setErrorMessage(null);
        return;
      } else if (activeEl && activeEl.id === 'search-input') {
        e.preventDefault();
        activeEl.blur();
        return;
      }
    }
  
    // Handle Backspace key
    if (e.key === 'Backspace') {
      // If the focused element is the search input...
      if (activeEl && activeEl.id === 'search-input') {
        // If the search input is empty, allow global backspace behavior
        if (activeEl.value === '' && currentPath !== 'system:/user/') {
          e.preventDefault();
          handlePathBackspace();
        }
        // Otherwise (search input has text) let it work normally.
        return;
      }
      // If the focused element is any other input or textarea, allow normal editing.
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        return;
      }
      // Otherwise, prevent backspace default.
      e.preventDefault();
      if (!searchQuery && currentPath !== 'system:/user/') {
        handlePathBackspace();
      }
    }
  };
  
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddingTask, selectedTask, currentPath, searchQuery, showFolderModal]);  

  return (
    <div className="app-container">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="left-content">
          <span className="greeting">{greeting}</span>
          <span className="statistics-date">{currentDate}</span>
        </div>
        <div className="top-bar-right">
          {/* No folder buttons here */}
          <span className="settings-gear" onClick={() => setShowSettings(true)}>
            <i className="fa fa-gear"></i>
          </span>
        </div>
      </div>
  
      {/* Folder Modal */}
      {showFolderModal && (
        <div className="modal-overlay" onClick={closeFolderModal}>
          <div className="modal folder" onClick={(e) => e.stopPropagation()}>
            <h3>{folderModalMode === "add" ? "Add Folder" : "Edit Folder"}</h3>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              required
            />
            <div className="modal-buttons">
              <button onClick={handleSaveFolder}>Save</button>
              <button onClick={closeFolderModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
  
      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay settings-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-settings">
              <form
                className="update-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  update(email, password);
                }}
              >
                <input
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
                <input
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button type="submit">Update</button>
                {error && <div className="error">{error}</div>}
              </form>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
            <button className="deleteAcc-button" onClick={() => alert("Account Delete not Implemented Yet.")}>
              Delete Account
            </button>
          </div>
        </div>
      )}
  
      {/* Filter Buttons */}
      <div className="filter-buttons">
        <div className="left-buttons">
          {viewType !== 'note' && (
            <button onClick={() => setViewType('task')} className={viewType === 'task' ? 'active' : ''}>
              <i className="fas fa-tasks"></i>
            </button>
          )}
          {viewType !== 'note' && (
            <>
               <button onClick={() => { setViewType('grid'); setNoteBack('grid'); }} className={viewType === 'grid' ? 'active' : ''}>
                <i className="fas fa-th-large"></i>
              </button>
              <button onClick={() => { setViewType('code'); setNoteBack('code'); }} className={viewType === 'code' ? 'active' : ''}>
                <i className="fas fa-code"></i>
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
              {currentPath !== "system:/user/" && (
                <>
                  <button className="edit-folder-button" onClick={() => openFolderModal("edit")}>
                    Edit Folder
                  </button>
                  <button className="delete-folder-button" onClick={handleDeleteFolder}>
                    Delete Folder
                  </button>
                </>
              )}
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
                className={`${viewType === 'code' ? 'file-item' : 'grid-item'} ${file.type} ${
                  selectedIndex === file._id ? 'selected' : ''
                }`}
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
  
      {/* Note View (Editable with Auto-save and Delete) */}
      {viewType === 'note' && selectedNote && (
        <div className="note-view">
          <div className="note-view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="back-button" onClick={() => setViewType(noteBack)}>
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
            <button className="create-button" onClick={handleCreateTask}>Create Task</button>
            <button className="close-button" onClick={() => setIsAddingTask(false)}>Cancel</button>
          </div>
        </div>
      )}
  
      {/* Viewing a Task */}
      {selectedTask && !isEditingTask && (
        <div className="modal-overlay">
          <div className="modal-view">
            <p className="modal-title unselectable">{selectedTask.title}</p>
            <p className="modal-date unselectable">
              {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : ''}
            </p>
            <p className="modal-details unselectable">{selectedTask.details}</p>
            <div className="modal-buttons">
              <button className="update-button" onClick={handleEditTask}>Edit</button>
              <button className="close-button" onClick={() => { setSelectedTask(null); setViewType('task'); }}>
                Close
              </button>
              <button className="deleteTask-button" onClick={() => { handleDelete(); setViewType('task'); }}>
                Delete
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
              onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
              required
            />
            <input
              className="modal-input"
              type="date"
              value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : ''}
              onChange={(e) => setSelectedTask({ ...selectedTask, dueDate: e.target.value })}
              required
            />
            <textarea
              className="modal-textarea"
              value={selectedTask.details}
              onChange={(e) => setSelectedTask({ ...selectedTask, details: e.target.value })}
              required
            />
            <div className="modal-buttons">
              <button
                className="update-button"
                onClick={() => {
                  handleUpdateTask();
                  setIsEditingTask(false);
                }}
              >
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