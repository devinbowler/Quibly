import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import "./task.css";
import { useTheme } from '../ThemeContext';
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
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

// Error Message Component
const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="form-error">
      {message}
    </div>
  );
};

const BlockNoteEditor = ({ noteContent, onChange }) => {
  // Reference to track if we're programmatically updating content
  const updatingRef = useRef(false);
  
  // Create the editor directly using the hook (don't create in useState or useEffect)
  const editor = useCreateBlockNote({
    // Parse initial content if it exists
    initialContent: useMemo(() => {
      if (!noteContent) return undefined;
      try {
        return JSON.parse(noteContent);
      } catch (e) {
        // console.error("Error parsing initial content:", e);
        return [{ type: "paragraph", content: [] }];
      }
    }, []),
  });
  
  // Handle user changes to the editor
  useEffect(() => {
    if (!editor) return;
    
    // Set up the change handler using the editor.onChange method
    const unsubscribe = editor.onChange(() => {
      if (!updatingRef.current) {
        // console.log("User changed content - triggering save");
        // Use editor.document instead of getJSON()
        const jsonContent = JSON.stringify(editor.document);
        onChange(jsonContent);
      }
    });
    
    // Cleanup function to remove the listener
    return () => {
      unsubscribe();
    };
  }, [editor, onChange]);
  
  // Update editor when props change
  useEffect(() => {
    if (!editor || !noteContent) return;
    
    try {
      const newContent = JSON.parse(noteContent);
      // Use editor.document instead of getJSON()
      const currentContent = editor.document;
      
      // Only update if content actually changed
      if (JSON.stringify(newContent) !== JSON.stringify(currentContent)) {
        // console.log("Updating editor with new content from props");
        
        // Set flag to prevent onChange from triggering
        updatingRef.current = true;
        
        // Update content - if replaceBlocks doesn't work, use the appropriate method
        // from the current BlockNote API
        try {
          editor.replaceBlocks(editor.document, newContent);
        } catch (e) {
          // console.error("Error with replaceBlocks, trying alternative method:", e);
          // Alternative approach if replaceBlocks isn't available
          editor.document = newContent;
        }
        
        // Reset the flag after a short delay
        setTimeout(() => {
          updatingRef.current = false;
        }, 50);
      }
    } catch (e) {
      // console.error("Error updating editor content:", e);
      updatingRef.current = false;
    }
  }, [noteContent, editor]);
  
  // Render the editor view
  return <BlockNoteView editor={editor} />;
};

function Task() {
  // State for settings modal
  const [showSettings, setShowSettings] = useState(false);
  const { logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Other state variables
  const [greeting, setGreeting] = useState('');
  const { darkMode, toggleTheme } = useTheme();
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
  
  // Password management
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const [collapsedPast, setCollapsedPast] = useState(() => {
    const saved = localStorage.getItem("collapsedPast");
    return saved ? JSON.parse(saved) : false;
  });
  const [collapsedToday, setCollapsedToday] = useState(() => {
    const saved = localStorage.getItem("collapsedToday");
    return saved ? JSON.parse(saved) : false;
  });
  const [collapsedWeek, setCollapsedWeek] = useState(() => {
    const saved = localStorage.getItem("collapsedWeek");
    return saved ? JSON.parse(saved) : false;
  });
  const [collapsedLater, setCollapsedLater] = useState(() => {
    const saved = localStorage.getItem("collapsedLater");
    return saved ? JSON.parse(saved) : false;
  });
  const [collapsedComplete, setCollapsedComplete] = useState(() => {
    const saved = localStorage.getItem("collapsedComplete");
    return saved ? JSON.parse(saved) : false;
  });

  // Folder modal state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState(""); // "add" or "edit"
  const [folderName, setFolderName] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if user is in password reset mode
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.passwordReset) {
      setIsPasswordReset(true);
    }
  }, []);

  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    try {
      // Get the token from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Create request body - only include currentPassword if not in reset mode
      const requestBody = isPasswordReset 
        ? { newPassword } 
        : { currentPassword, newPassword };
      
      const response = await fetch('https://quibly.onrender.com/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      const json = await response.json();
      
      if (!response.ok) {
        setPasswordError(json.error || "An error occurred");
        setPasswordSuccess(null);
      } else {
        // Update local storage to remove passwordReset flag if it was set
        if (isPasswordReset) {
          user.passwordReset = false;
          localStorage.setItem('user', JSON.stringify(user));
          setIsPasswordReset(false);
        }
        
        setPasswordSuccess("Password changed successfully");
        setPasswordError(null);
        
        // Clear input fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError("An error occurred. Please try again later.");
      setPasswordSuccess(null);
    }
  };

  // Helper function for the task title
  const getTruncatedTitle = (title) => {
    const isMobile = window.innerWidth < 600;
    if (isMobile) {
      return title.length > 10 ? title.slice(0, 7) + "..." : title;
    } else {
      return title.length > 20 ? title.slice(0, 17) + "..." : title;
    }
  };

  // Helper function for task details
  const getTruncatedDetails = (details) => {
    const isMobile = window.innerWidth < 600;
    if (isMobile) {
      return details.length > 10 ? details.slice(0, 10) + "..." : details;
    } else {
      return details; // show full details on desktop
    }
  };

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

  // Folder modal functions
  const openFolderModal = (mode) => {
    setFolderModalMode(mode);
    if (mode === "edit") {
      setFolderName("");
    } else {
      setFolderName("");
    }
    setShowFolderModal(true);
    setErrorMessage(null);
  };

  const closeFolderModal = () => {
    setShowFolderModal(false);
    setFolderModalMode("");
    setFolderName("");
    setErrorMessage(null);
  };

  // Determine the current folder object (if not at root)
  let currentFolderObj = null;
  if (currentPath !== "system:/user/") {
    const segments = currentPath.split('/').filter(s => s !== '');
    const currentFolderName = segments[segments.length - 1];
    currentFolderObj = files.find(file => file.type === 'folder' && file.name === currentFolderName);
  }

  const handleSaveFolder = async () => {
    if (!folderName.trim()) {
      setErrorMessage('Folder name is required');
      return;
    }

    if (folderModalMode === "add") {
      // Create a new folder with the entered name
      try {
        const newFolder = await createFolder({ name: folderName, parentFolder: currentPath });
        setFiles([...files, newFolder]);
        setFilteredFiles([...filteredFiles, newFolder]);
        closeFolderModal();
      } catch (error) {
        setErrorMessage("Failed to create folder.");
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
        setErrorMessage("Failed to update folder.");
      }
    }
  };

  // Delete folder (and all nested content)
  const handleDeleteFolder = async () => {
    if (!currentFolderObj) {
      setErrorMessage("No folder to delete.");
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
      setErrorMessage("Failed to delete folder.");
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Add or remove a class from body to help with hiding the top bar
    if (!isFullscreen) {
      document.body.classList.add('fullscreen-active');
    } else {
      document.body.classList.remove('fullscreen-active');
    }
  };

  const selectedNoteRef = useRef();
  const filesRef = useRef();
  const filteredFilesRef = useRef();

  // Update these refs when state changes
  useEffect(() => {
    selectedNoteRef.current = selectedNote;
    filesRef.current = files;
    filteredFilesRef.current = filteredFiles;
  }, [selectedNote, files, filteredFiles]);

  // Updated handleNoteChange function
  const handleNoteChange = (field, value) => {
    // console.log(`handleNoteChange called: field=${field}, value=${typeof value === 'string' ? value.substring(0, 30) + '...' : 'non-string value'}`);
    
    // Create updated note with new content
    const updatedNote = { ...selectedNote, [field]: value };
    
    // Update state immediately for responsive UI
    setSelectedNote(updatedNote);
    
    // Trigger the debounced save
    console.log("Triggering debouncedSaveNote");
    debouncedSaveNote(updatedNote);
  };

  // Improved debouncedSaveNote function using refs for current state
  const debouncedSaveNote = useCallback(
    debounce(async (note) => {
      console.log("debouncedSaveNote executing.");
      if (!note._id) {
        console.warn("No note ID, cannot save");
        return;
      }
      
      setIsSaving(true);
      setSaveMessage("Saving...");
      
      try {        
        await saveNote(note._id, {
          title: note.title,
          body: note.body
        });
        
        // console.log("saveNote API call successful");
        
        // Using the current files state via ref
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
        
        setErrorMessage(null);
        setSaveMessage("Saved.");
        setTimeout(() => {
          setSaveMessage("");
        }, 3000); // Clear the message after 3 seconds
      } catch (error) {
        // console.error("Error saving note:", error);
        setErrorMessage("Failed to save note.");
        setSaveMessage("");
      } finally {
        setIsSaving(false);
      }
    }, 1000), // 1 second debounce
    [] // Empty dependency array is safe because we use refs
  );
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
    // Validation
    if (!newTask.name.trim()) {
      setErrorMessage('Task title is required');
      return;
    }
    if (!newTask.dueDate) {
      setErrorMessage('Due date is required');
      return;
    }
    
    // Clear any previous errors
    setErrorMessage(null);

    const localDueDate = new Date(newTask.dueDate + 'T00:00:00');
    const newTaskData = {
      title: newTask.name,
      dueDate: localDueDate,
      color: newTask.color || '#495BFA', // Default color if not set
      details: newTask.details || '',
      completed: 'false',
    };
    
    try {
      const createdTask = await createTask(newTaskData);
      setTasks([...tasks, createdTask]);
      setIsAddingTask(false);
      setIsEditingTask(false);
      setNewTask({ name: '', dueDate: '', color: '', details: '', completed: 'false' });
    } catch (error) {
      console.error('Error creating task:', error);
      setErrorMessage('Failed to create task. Please try again.');
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    try {
      const localDueDate = new Date(selectedTask.dueDate + 'T00:00:00');
      
      const updatedTask = await updateTask(selectedTask._id, {
        title: selectedTask.title,
        dueDate: localDueDate,
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
    setErrorMessage(null);
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

  const handleKeyDown = (e) => {
    if (showFolderModal) return;
    const activeEl = document.activeElement;
    const tag = activeEl ? activeEl.tagName.toUpperCase() : '';
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
  };

  const hexToRGBA = (hex, alpha) => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleToggleCompleted = async (e, task) => {
    e.stopPropagation();
    const newCompletedValue = task.completed === 'true' ? 'false' : 'true';
    try {
      const updatedTask = await updateTask(task._id, { completed: newCompletedValue });
      setTasks(prevTasks =>
        prevTasks.map(t => (t._id === updatedTask._id ? updatedTask : t))
      );
    } catch (error) {
      console.error('Error updating task completed status:', error);
    }
  };

  const goBackInPath = () => {
  // Only proceed if we are not at the default path
  if (currentPath !== "system:/user/") {
    // Remove the last folder segment from the path
    let newPath = currentPath.replace(/\/[^/]+\/?$/, '');
    // Ensure the new path is valid
    if (newPath === '' || newPath === 'system:/user') {
      newPath = 'system:/user/';
    }
    setCurrentPath(newPath);
  }
};

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [tasks]);

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const weekFromToday = new Date(todayDate);
  weekFromToday.setDate(todayDate.getDate() + 7);

  const pastDue = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < todayDate && task.completed !== 'true';
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const dueToday = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === todayDate.getTime() && task.completed !== 'true';
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const dueThisWeek = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate > todayDate && taskDate <= weekFromToday && task.completed !== 'true';
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const dueLater = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate > weekFromToday && task.completed !== 'true';
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const completedTasks = tasks.filter(task => task.completed === 'true')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddingTask, selectedTask, currentPath, searchQuery, showFolderModal]);

  useEffect(() => {
    localStorage.setItem("collapsedPast", JSON.stringify(collapsedPast));
  }, [collapsedPast]);

  useEffect(() => {
    localStorage.setItem("collapsedToday", JSON.stringify(collapsedToday));
  }, [collapsedToday]);

  useEffect(() => {
    localStorage.setItem("collapsedWeek", JSON.stringify(collapsedWeek));
  }, [collapsedWeek]);

  useEffect(() => {
    localStorage.setItem("collapsedLater", JSON.stringify(collapsedLater));
  }, [collapsedLater]);

  useEffect(() => {
    localStorage.setItem("collapsedComplete", JSON.stringify(collapsedComplete));
  }, [collapsedComplete]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('fullscreen-active');
    };
  }, []);


return (
  <div className="app-container">
    {/* Top Bar */}
    <div className="top-bar">
      <div className="left-content">
        <span className="greeting">{greeting}</span>
        <span className="statistics-date">{currentDate}</span>
      </div>
      <div className="top-bar-right">
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
          <ErrorMessage message={errorMessage} />
          <div className="modal-buttons">
            <button onClick={handleSaveFolder}>Save</button>
            <button onClick={closeFolderModal}>Cancel</button>
          </div>
        </div>
      </div>
    )}

    {/* Settings Modal */}
    {showSettings && (
      <div className="modal-overlay settings-modal-overlay" onClick={() => {
        setShowSettings(false);
        setPasswordError(null);
        setPasswordSuccess(null);
      }}>
        <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => {
            setShowSettings(false);
            setPasswordError(null);
            setPasswordSuccess(null);
          }}>
            <i className="fas fa-times"></i>
          </button>
          
          <div className="theme-toggle">
            <span className="toggle-label">Dark Mode</span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={toggleTheme}
              />
              <span className="toggle-slider">
                <i className="fas fa-sun light-icon"></i>
                <i className="fas fa-moon dark-icon"></i>
              </span>
            </label>
          </div>
          
          <div className="user-settings">
            <h3>Change Password</h3>
            {isPasswordReset && (
              <div className="password-reset-notice">
                For security reasons, please create a new password.
              </div>
            )}
            
            <form
              className="update-form"
              onSubmit={handlePasswordChange}
            >
              {!isPasswordReset && (
                <input
                  type="password"
                  value={currentPassword || ''}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  required={!isPasswordReset}
                />
              )}
              <input
                type="password"
                value={newPassword || ''}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                required
              />
              <input
                type="password"
                value={confirmPassword || ''}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                required
              />
              
              <button type="submit">
                {isPasswordReset ? "Set New Password" : "Update Password"}
              </button>
              
              {passwordError && <div className="error">{passwordError}</div>}
              {passwordSuccess && <div className="success">{passwordSuccess}</div>}
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
      { viewType !== 'note' && (
        <>
          { viewType === 'task' ? (
              // At root: Combined buttons – view selectors (left) and Add Task (right)
              <div className="combined-buttons">
                <div className="left-group">
                  <button onClick={() => setViewType('task')} className={viewType === 'task' ? 'active' : ''}>
                    <i className="fas fa-tasks"></i>
                  </button>
                  <button onClick={() => { setViewType('grid'); setNoteBack('grid'); }} className={viewType === 'grid' ? 'active' : ''}>
                    <i className="fas fa-th-large"></i>
                  </button>
                </div>
                <div className="right-group">
                  <button onClick={openAddTaskModal}>Add Task</button>
                </div>
              </div>
            ) : (
            <>
              <div className="left-buttons">
                <button onClick={() => setViewType('task')} className={viewType === 'task' ? 'active' : ''}>
                  <i className="fas fa-tasks"></i>
                </button>
                <button onClick={() => { setViewType('grid'); setNoteBack('grid'); }} className={viewType === 'grid' ? 'active' : ''}>
                  <i className="fas fa-th-large"></i>
                </button>
              </div>
              <div className="right-buttons">
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
              </div>
            </>
          )}
        </>
      )}
    </div>

    {viewType === 'grid' && currentPath !== "system:/user/" && (
      <div className="back-button-container">
        <button className="back-button" onClick={goBackInPath}>← Back</button>
      </div>
    )}

    {/* Error Message */}
    {errorMessage && viewType !== 'note' && !showFolderModal && !isAddingTask && (
      <ErrorMessage message={errorMessage} />
    )}

    {/* Task View */}
    {(viewType === 'task' || viewType === 'taskDetails') && (
      <div className="file-system-viewer">
        {/* Past Due */}
        <div className="task-group">
          <div className="section-header">
            <div className="collapse" onClick={() => {setCollapsedPast(!collapsedPast)}} style={{ transform: collapsedPast ? '' : "rotate(90deg)" }}>
              >
            </div>
            <div className="group-label">
              <h2>Past Due</h2>
            </div>
            <div className="task-count">
              {pastDue.length} Tasks
            </div>
          </div>
          <div className={`tasks-container ${collapsedPast ? 'collapsed-style' : ''}`}>
            {pastDue.length > 0 ? (
              pastDue.map((task) => (
                <div
                  key={task._id}
                  className={`task-item ${selectedTask?._id === task._id ? 'selected' : ''}`}
                  onClick={() => openTaskDetailsModal(task)}
                  style={{
                    backgroundColor: 'rgba(255, 0, 0, 0.05)'
                  }}
                >
                  <div className="task-info">
                    <span
                      className="task-title"
                      style={{
                        backgroundColor: task.color ? hexToRGBA(task.color, 0.1) : "transparent"
                      }}
                    >
                      {task.title ? getTruncatedTitle(task.title) : ""}
                    </span>
                    <span className="task-details">
                      {task.details ? getTruncatedDetails(task.details, 50) : ""}
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
                    <input
                      type="checkbox"
                      className="task-completed-checkbox"
                      checked={task.completed === 'true'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleCompleted(e, task);
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No past due tasks.</p>
            )}
          </div>
        </div>

        {/* Due Today */}
        <div className="task-group">
          <div className="section-header">
            <div className="collapse" onClick={() => {setCollapsedToday(!collapsedToday)}} style={{ transform: collapsedToday ? '' : "rotate(90deg)" }}>
              >
            </div>
            <div className="group-label">
              <h2>Due Today</h2>
            </div>
            <div className="task-count">
              {dueToday.length} Tasks
            </div>
          </div>
          <div className={`tasks-container ${collapsedToday ? 'collapsed-style' : ''}`}>
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
                      {task.title ? getTruncatedTitle(task.title) : ""}
                    </span>
                    <span className="task-details">
                      {task.details ? getTruncatedDetails(task.details, 50) : ""}
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
                    <input
                      type="checkbox"
                      className="task-completed-checkbox"
                      checked={task.completed === 'true'}
                      onClick={(e) => e.stopPropagation()}
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
          <div className="section-header">
            <div className="collapse" onClick={() => {setCollapsedWeek(!collapsedWeek)}} style={{ transform: collapsedWeek ? '' : "rotate(90deg)" }}>
              >
            </div>
            <div className="group-label">
              <h2>Due This Week</h2>
            </div>
            <div className="task-count">
              {dueThisWeek.length} Tasks
            </div>
          </div>
          <div className={`tasks-container ${collapsedWeek ? 'collapsed-style' : ''}`}>
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
                      {task.title ? getTruncatedTitle(task.title) : ""}
                    </span>
                    <span className="task-details">
                      {task.details ? getTruncatedDetails(task.details, 50) : ""}
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
                    <input
                      type="checkbox"
                      className="task-completed-checkbox"
                      checked={task.completed === 'true'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
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
          <div className="section-header">
            <div className="collapse" onClick={() => {setCollapsedLater(!collapsedLater)}} style={{ transform: collapsedLater ? '' : "rotate(90deg)" }}>
              >
            </div>
            <div className="group-label">
              <h2>Due Later</h2>
            </div>
            <div className="task-count">
              {dueLater.length} Tasks
            </div>
          </div>
          <div className={`tasks-container ${collapsedLater ? 'collapsed-style' : ''}`}>
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
                      {task.title ? getTruncatedTitle(task.title) : ""}
                    </span>
                    <span className="task-details">
                      {task.details ? getTruncatedDetails(task.details, 50) : ""}
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
                    <input
                      type="checkbox"
                      className="task-completed-checkbox"
                      checked={task.completed === 'true'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
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
          <div className="section-header">
            <div className="collapse" onClick={() => {setCollapsedComplete(!collapsedComplete)}} style={{ transform: collapsedComplete ? '' : "rotate(90deg)" }}>
              >
            </div>
            <div className="group-label">
              <h2>Completed Tasks</h2>
            </div>
            <div className="task-count">
              {completedTasks.length} Tasks
            </div>
          </div>
          <div className={`tasks-container ${collapsedComplete ? 'collapsed-style' : ''}`}>
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
                      {task.title ? getTruncatedTitle(task.title) : ""}
                    </span>
                    <span className="task-details" style={{ textDecoration: "line-through" }}>
                      {task.details ? getTruncatedDetails(task.details, 50) : ""}
                    </span>
                  </div>
                  <div className="task-meta">
                    <span className="task-due" style={{ textDecoration: "line-through" }}>
                      {new Date(task.dueDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </span>
                    <input
                      type="checkbox"
                      className="task-completed-checkbox"
                      checked={task.completed === 'true'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
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
          
          {/* Error message */}
          {errorMessage && <div className="error">{errorMessage}</div>}
          
          {/* Updated button layout */}
          <div className="modal-buttons">
            <button className="create-button" onClick={handleCreateTask}>Create Task</button>
            <button className="editing close-button" onClick={() => {
              setIsAddingTask(false);
              setErrorMessage(null);
            }}>Cancel</button>
          </div>
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
              <button className="viewing deleteTask-button" onClick={() => { handleDelete(); setViewType('task'); setErrorMessage(null); }}>
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
          <ErrorMessage message={errorMessage} />
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

    {/* Code View and Grid View */}
    {viewType === 'grid' && (
      <div className="grid-view">
        {files.filter(file => file.parentFolder === currentPath).map((file) => (
          <div
            key={file._id}
            className={`grid-item ${file.type} ${selectedIndex === file._id ? 'selected' : ''}`}
            onClick={() => handleFileClick(file)}
          >
            <i className={`fas ${file.type === 'folder' ? 'fa-folder' : 'fa-file'}`}></i>
            <span className="file-name">
              {file.type === 'folder' ? file.name : file.title}
            </span>
          </div>
        ))}
      </div>
    )}

    {/* Note View */}
    {/* Note View with BlockNote Editor */}
    {viewType === 'note' && selectedNote && (
      <div className={`note-view ${isFullscreen ? 'fullscreen-editor' : ''}`}>
        {!isFullscreen && (
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
        )}
        
        {isFullscreen && (
          <button className="fullscreen-button" onClick={toggleFullscreen} style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 10000 }}>
            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
        )}
        
        {!isFullscreen && (
          <input
            className="note-title"
            placeholder="Enter note title..."
            value={selectedNote.title}
            onChange={(e) => handleNoteChange('title', e.target.value)}
          />
        )}
        
        <ErrorMessage message={errorMessage} />
        
        {/* BlockNote Editor */}
        <div className="editor-container" style={{ height: isFullscreen ? "95vh" : "75vh" }}>
          <BlockNoteEditor 
            noteContent={selectedNote.body}
            onChange={(newContent) => handleNoteChange('body', newContent)}
          />
        </div>
      </div>
    )}
  </div>
);
}

export default Task;
