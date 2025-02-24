import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [newTask, setNewTask] = useState({ name: '', dueDate: '', color: '', details: '', completed: 'false' });
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
  const localDueDate = new Date(newTask.dueDate + 'T00:00:00');
  const newTaskData = {
    title: newTask.name,
    dueDate: localDueDate,
    color: newTask.color,
    details: newTask.details,
    completed: 'false',
  };
  console.log('handleCreateTask payload:', newTaskData); // Frontend logging
  try {
    const createdTask = await createTask(newTaskData);
    setTasks([...tasks, createdTask]);
    setIsAddingTask(false);
    setIsEditingTask(false);
    setNewTask({ name: '', dueDate: '', color: '', details: '', completed: 'false' });
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
        color: selectedTask.color,
        details: selectedTask.details,
        completed: selectedTask.completed,
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


  const hexToRGBA = (hex, alpha) => {
    // Remove '#' if present
    hex = hex.replace(/^#/, '');

    // Convert shorthand hex (e.g., #abc to #aabbcc)
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    // Parse r, g, b values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  const handleToggleCompleted = async (e, task) => {
    // Prevent the click event from bubbling up
    e.stopPropagation();

    // Toggle the completed value: if it's 'true', make it 'false'; otherwise, 'true'
    const newCompletedValue = task.completed === 'true' ? 'false' : 'true';

    try {
      // Call your API to update the task with the new completed value
      const updatedTask = await updateTask(task._id, { completed: newCompletedValue });

      // Update the tasks state by replacing the updated task
      setTasks(prevTasks =>
        prevTasks.map(t => (t._id === updatedTask._id ? updatedTask : t))
      );
    } catch (error) {
      console.error('Error updating task completed status:', error);
    }
  };


  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [tasks]);


  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const weekFromToday = new Date(todayDate);
  weekFromToday.setDate(todayDate.getDate() + 7);

  const dueToday = tasks
    .filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === todayDate.getTime() && task.completed !== 'true';
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const dueThisWeek = tasks
    .filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > todayDate && taskDate <= weekFromToday && task.completed !== 'true';
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const dueLater = tasks
    .filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > weekFromToday && task.completed !== 'true';
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const completedTasks = tasks
    .filter(task => task.completed === 'true')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
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
          {/* Due Today */}
          <div className="task-group">
            <h2>Due Today</h2>
            <div className="tasks-container">
              {dueToday.length > 0 ? (
                dueToday.map((task) => (
                  <div
                    key={task._id}
                    className={`task-item ${selectedTask?._id === task._id ? 'selected' : ''}`}
                    onClick={() => openTaskDetailsModal(task)}
                  >
                    <div className="task-info">
                      <span
                        className="task-title"
                        style={{
                          backgroundColor: task.color ? hexToRGBA(task.color, 0.2) : "transparent"
                        }}
                      >
                        {task.title}
                      </span>
                      <span className="task-details">
                        {task.details && task.details.length > 100
                          ? task.details.slice(0, 100) + "..."
                          : task.details}
                      </span>
                    </div>
                    <div className="task-meta">
                      <span className="task-due">
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                      {/* Incomplete task checkbox */}
                      <input
                        type="checkbox"
                        className="task-completed-checkbox"
                        checked={false}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleCompleted(e, task);
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p>No tasks due today.</p>
              )}
            </div>
          </div>

          {/* Due This Week */}
          <div className="task-group">
            <h2>Due This Week</h2>
            <div className="tasks-container">
              {dueThisWeek.length > 0 ? (
                dueThisWeek.map((task) => (
                  <div
                    key={task._id}
                    className={`task-item ${selectedTask?._id === task._id ? 'selected' : ''}`}
                    onClick={() => openTaskDetailsModal(task)}
                  >
                    <div className="task-info">
                      <span
                        className="task-title"
                        style={{
                          backgroundColor: task.color ? hexToRGBA(task.color, 0.2) : "transparent"
                        }}
                      >
                        {task.title}
                      </span>
                      <span className="task-details">
                        {task.details && task.details.length > 100
                          ? task.details.slice(0, 100) + "..."
                          : task.details}
                      </span>
                    </div>
                    <div className="task-meta">
                      <span className="task-due">
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                      {/* Incomplete task checkbox */}
                      <input
                        type="checkbox"
                        className="task-completed-checkbox"
                        checked={task.completed === 'true'}
                        onClick={(e) => e.stopPropagation()} // stops the click event from bubbling up
                        onChange={(e) => {
                          e.stopPropagation(); // extra precaution here
                          handleToggleCompleted(e, task);
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p>No tasks due this week.</p>
              )}
            </div>
          </div>

          {/* Due Later */}
          <div className="task-group">
            <h2>Due Later</h2>
            <div className="tasks-container">
              {dueLater.length > 0 ? (
                dueLater.map((task) => (
                  <div
                    key={task._id}
                    className={`task-item ${selectedTask?._id === task._id ? 'selected' : ''}`}
                    onClick={() => openTaskDetailsModal(task)}
                  >
                    <div className="task-info">
                      <span
                        className="task-title"
                        style={{
                          backgroundColor: task.color ? hexToRGBA(task.color, 0.2) : "transparent"
                        }}
                      >
                        {task.title}
                      </span>
                      <span className="task-details">
                        {task.details && task.details.length > 100
                          ? task.details.slice(0, 100) + "..."
                          : task.details}
                      </span>
                    </div>
                    <div className="task-meta">
                      <span className="task-due">
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                      {/* Incomplete task checkbox */}
                      <input
                        type="checkbox"
                        className="task-completed-checkbox"
                        checked={task.completed === 'true'}
                        onClick={(e) => e.stopPropagation()} // stops the click event from bubbling up
                        onChange={(e) => {
                          e.stopPropagation(); // extra precaution here
                          handleToggleCompleted(e, task);
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p>No tasks due later.</p>
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="task-group" style={{ marginTop: "100px" }}>
            <h2>Completed Tasks</h2>
            <div className="tasks-container">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`task-item completed ${selectedTask?._id === task._id ? 'selected' : ''}`}
                    onClick={() => openTaskDetailsModal(task)}
                  >
                    <div className="task-info">
                      <span
                        className="task-title"
                        style={{
                          backgroundColor: task.color ? hexToRGBA(task.color, 0.2) : "transparent",
                          textDecoration: "line-through"
                        }}
                      >
                        {task.title}
                      </span>
                      <span
                        className="task-details"
                        style={{ textDecoration: "line-through" }}
                      >
                        {task.details && task.details.length > 100
                          ? task.details.slice(0, 100) + "..."
                          : task.details}
                      </span>
                    </div>
                    <div className="task-meta">
                      <span
                        className="task-due"
                        style={{ textDecoration: "line-through" }}
                      >
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                      {/* Completed task checkbox – checked by default */}
                       <input
                        type="checkbox"
                        className="task-completed-checkbox"
                        checked={task.completed === 'true'}
                        onClick={(e) => e.stopPropagation()} // stops the click event from bubbling up
                        onChange={(e) => {
                          e.stopPropagation(); // extra precaution here
                          handleToggleCompleted(e, task);
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p>No completed tasks.</p>
              )}
            </div>
          </div>
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
            <input
              className="modal-input"
              type="color"
              value={newTask.color}
              onChange={(e) => setNewTask({ ...newTask, color: e.target.value })}
            />
            <textarea
              className="modal-textarea"
              placeholder="Details"
              value={newTask.details}
              onChange={(e) => setNewTask({ ...newTask, details: e.target.value })}
            />
            <button className="create-button" onClick={handleCreateTask}>Create Task</button>
            <button className="editing close-button" onClick={() => setIsAddingTask(false)}>Cancel</button>
          </div>
        </div>
      )}
  
      {/* Viewing a Task */}
      {selectedTask && !isEditingTask && (
        <div className="modal-overlay">
          <div className="modal-view">
            <div className="modal-header">
              <p className="modal-title unselectable">{selectedTask.title}</p>
              <div className="viewing modal-buttons">
                <button className="viewing deleteTask-button" onClick={() => { handleDelete(); setViewType('task'); }}>
                  <i className="fa-solid fa-trash"></i>
                </button>
                <button className="viewing update-button" onClick={handleEditTask}>
                  <i className="fa-solid fa-pencil"></i> 
                </button>
                <button className="viewing close-button" onClick={() => { setSelectedTask(null); setViewType('task'); }}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <p className="modal-date unselectable">
              {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : ''}
            </p>
            <p className="modal-details unselectable">{selectedTask.details}</p>
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
              value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setSelectedTask({ ...selectedTask, dueDate: e.target.value })}
              required
            />
            <input
              className="modal-input"
              type="color"
              value={selectedTask.color}
              onChange={(e) => setSelectedTask({ ...selectedTask, color: e.target.value })}
            />
            <textarea
              className="modal-textarea"
              value={selectedTask.details}
              onChange={(e) => setSelectedTask({ ...selectedTask, details: e.target.value })}
              required
            />
            <div className="editing modal-buttons">
              <button
                className="editing update-button"
                onClick={() => {
                  handleUpdateTask();
                  setIsEditingTask(false);
                }}
              >
                Update
              </button>
              <button
                className="editing close-button"
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
