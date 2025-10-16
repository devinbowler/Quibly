
import React, { useState, useEffect } from 'react';
import "./task.css";
import { useTheme } from '../ThemeContext';
import {
  fetchAllTasks,
  createTask,
  updateTask as updateTaskAPI,
  deleteTask as deleteTaskAPI,
  toggleTaskCompletion,
  fetchAllDailyTasks,
  createMultipleDailyTasks,
  toggleDailyTaskCompletion,
  generateTasksFromPrompt
} from '../api/api';
import { useLogout } from '../hooks/useLogout';
import { useNavigate } from 'react-router-dom';

function Task() {
  const [showSettings, setShowSettings] = useState(false);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [view, setView] = useState('task');
  
  // Separate state for calendar tasks and daily tasks
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  
  const [showAddTask, setShowAddTask] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [taskPrompt, setTaskPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(new Date());
  const [selectedMiniDay, setSelectedMiniDay] = useState(new Date());
  const [isPromptCollapsed, setIsPromptCollapsed] = useState(false);
  const [isEditingDailyTasks, setIsEditingDailyTasks] = useState(false);
  const [editedDailyTasks, setEditedDailyTasks] = useState({});
  
  const [newTask, setNewTask] = useState({
    title: '',
    details: '',
    dueDate: '',
    color: '#495BFA'
  });

  // Password management states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.passwordReset) {
      setIsPasswordReset(true);
    }
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const requestBody = isPasswordReset 
        ? { newPassword } 
        : { currentPassword, newPassword };
      
      const response = await fetch('http://localhost:4000/api/user/change-password', {
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
        if (isPasswordReset) {
          user.passwordReset = false;
          localStorage.setItem('user', JSON.stringify(user));
          setIsPasswordReset(false);
        }
        
        setPasswordSuccess("Password changed successfully");
        setPasswordError(null);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setPasswordError("An error occurred. Please try again later.");
      setPasswordSuccess(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening');
    const now = new Date();
    setCurrentDate(`${now.toLocaleString('default', { month: 'long' })} ${now.getDate()}, ${now.getFullYear()}`);
  }, []);

  // Load calendar tasks (for calendar view)
  const loadCalendarTasks = async () => {
    try {
      const data = await fetchAllTasks();
      if (Array.isArray(data)) {
        setCalendarTasks(data);
      } else {
        console.error('Calendar tasks data is not an array:', data);
        setCalendarTasks([]);
      }
    } catch (error) {
      console.error('Error loading calendar tasks:', error);
      setCalendarTasks([]);
    }
  };

  // Load daily tasks (for AI Tasks view)
  const loadDailyTasks = async () => {
    try {
      const data = await fetchAllDailyTasks();
      if (Array.isArray(data)) {
        setDailyTasks(data);
      } else {
        console.error('Daily tasks data is not an array:', data);
        setDailyTasks([]);
      }
    } catch (error) {
      console.error('Error loading daily tasks:', error);
      setDailyTasks([]);
    }
  };

  useEffect(() => {
    loadCalendarTasks();
    loadDailyTasks();
  }, []);

  const getTasksForDate = (date) => {
    if (!Array.isArray(calendarTasks)) {
      console.warn('Calendar tasks is not an array:', calendarTasks);
      return [];
    }
    
    const dateStr = date.toISOString().split('T')[0];
    return calendarTasks.filter(task => {
      if (!task || !task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  // Get active (incomplete) daily tasks
  const getActiveDailyTasks = () => {
    if (!Array.isArray(dailyTasks)) return [];
    return dailyTasks.filter(task => task.completed !== 'true');
  };

  // Get completed daily tasks
  const getCompletedDailyTasks = () => {
    if (!Array.isArray(dailyTasks)) return [];
    return dailyTasks.filter(task => task.completed === 'true');
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getMiniCalendarDays = () => {
    const year = miniCalendarMonth.getFullYear();
    const month = miniCalendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const changeMiniMonth = (delta) => {
    const newDate = new Date(miniCalendarMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setMiniCalendarMonth(newDate);
    setCurrentMonth(newDate); // Sync main calendar with mini calendar
  };

  const handleMiniDayClick = (date) => {
    setSelectedMiniDay(date);
  };

  const getSelectedDayTasks = () => {
    if (!Array.isArray(calendarTasks)) return [];
    const dateStr = selectedMiniDay.toISOString().split('T')[0];
    return calendarTasks.filter(task => {
      if (!task || !task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const handleGenerateTasks = async () => {
    if (!taskPrompt.trim()) return;
    
    setIsGenerating(true);
    setErrorMessage(null);
    
    try {
      // Generate tasks using AI
      const generatedTasks = await generateTasksFromPrompt(taskPrompt, dailyTasks);
      
      if (!Array.isArray(generatedTasks)) {
        throw new Error('Generated tasks is not an array');
      }
      
      // This will automatically delete old daily tasks and create new ones
      const created = await createMultipleDailyTasks(generatedTasks);
      
      if (Array.isArray(created)) {
        setDailyTasks(created);
      } else {
        setDailyTasks([created]);
      }
      
      setTaskPrompt('');
      setIsPromptCollapsed(true);
      
      console.log(`✨ Generated ${created.length} daily task${created.length > 1 ? 's' : ''} successfully!`);
      
    } catch (error) {
      console.error('Error generating tasks:', error);
      
      let errorMsg = 'Failed to generate tasks. ';
      
      if (error.message.includes('API key')) {
        errorMsg += 'Please check your OpenAI API key in the .env file.';
      } else if (error.message.includes('quota')) {
        errorMsg += 'API quota exceeded. Please check your OpenAI account.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMsg += 'Network error. Please check your internet connection.';
      } else {
        errorMsg += error.message || 'Please try again with a different prompt.';
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.dueDate) {
      setErrorMessage('Title and due date are required');
      return;
    }
    
    setErrorMessage(null);
    
    try {
      const created = await createTask(newTask);
      
      if (Array.isArray(calendarTasks)) {
        setCalendarTasks([...calendarTasks, created]);
      } else {
        setCalendarTasks([created]);
      }
      
      setNewTask({ title: '', details: '', dueDate: '', color: '#495BFA' });
      setShowAddTask(false);
    } catch (error) {
      console.error('Error creating task:', error);
      setErrorMessage('Failed to create task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTaskAPI(taskId);
      
      if (Array.isArray(calendarTasks)) {
        setCalendarTasks(calendarTasks.filter(t => t._id !== taskId));
      }
      
      setViewingTask(null); // Close viewing modal after delete
    } catch (error) {
      console.error('Error deleting task:', error);
      setErrorMessage('Failed to delete task.');
    }
  };

  const handleEditTask = async () => {
    if (!editingTask.title || !editingTask.dueDate) {
      setErrorMessage('Title and due date are required');
      return;
    }
    
    setErrorMessage(null);
    
    try {
      const updated = await updateTaskAPI(editingTask._id, {
        title: editingTask.title,
        details: editingTask.details,
        dueDate: editingTask.dueDate,
        color: editingTask.color
      });
      
      if (Array.isArray(calendarTasks)) {
        setCalendarTasks(calendarTasks.map(t => t._id === editingTask._id ? updated : t));
      }
      
      setEditingTask(null);
      setViewingTask(null);
    } catch (error) {
      console.error('Error editing task:', error);
      setErrorMessage('Failed to edit task. Please try again.');
    }
  };

  const handleToggleCalendarTask = async (taskId) => {
    try {
      const updated = await toggleTaskCompletion(taskId);
      
      if (Array.isArray(calendarTasks)) {
        setCalendarTasks(calendarTasks.map(t => t._id === taskId ? updated : t));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleToggleDailyTask = async (taskId) => {
    try {
      const updated = await toggleDailyTaskCompletion(taskId);
      
      if (Array.isArray(dailyTasks)) {
        setDailyTasks(dailyTasks.map(t => t._id === taskId ? updated : t));
      }
    } catch (error) {
      console.error('Error toggling daily task:', error);
    }
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  // Handle Edit Daily Tasks button click
  const handleEditDailyTasks = () => {
    if (isEditingDailyTasks) {
      // Save mode - save all edited tasks
      handleSaveDailyTasks();
    } else {
      // Edit mode - initialize edited tasks state
      const initialEditedTasks = {};
      getActiveDailyTasks().forEach(task => {
        initialEditedTasks[task._id] = {
          title: task.title,
          details: task.details
        };
      });
      setEditedDailyTasks(initialEditedTasks);
      setIsEditingDailyTasks(true);
    }
  };

  // Update edited task values
  const handleEditedTaskChange = (taskId, field, value) => {
    setEditedDailyTasks(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
  };

  // Save all edited daily tasks
  const handleSaveDailyTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Update each edited task
      const updatePromises = Object.entries(editedDailyTasks).map(async ([taskId, editedTask]) => {
        const response = await fetch(`http://localhost:4000/api/dailytasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            title: editedTask.title,
            details: editedTask.details
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update task');
        }
        
        return response.json();
      });
      
      const updatedTasks = await Promise.all(updatePromises);
      
      // Update the dailyTasks state with the new values
      setDailyTasks(prevTasks => 
        prevTasks.map(task => {
          const updated = updatedTasks.find(ut => ut._id === task._id);
          return updated || task;
        })
      );
      
      setIsEditingDailyTasks(false);
      setEditedDailyTasks({});
      
    } catch (error) {
      console.error('Error saving daily tasks:', error);
      setErrorMessage('Failed to save tasks. Please try again.');
    }
  };



  const calendarDays = getCalendarDays();
  const miniCalendarDays = getMiniCalendarDays();
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="app-container">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="left-content">
          <span className="greeting">{greeting}</span>
          <span className="statistics-date">{currentDate}</span>
        </div>
        
        {/* View Toggle - Centered */}
        <div className="filter-buttons">
          <div className="left-buttons">
            <button onClick={() => setView('task')} className={view === 'task' ? 'active' : ''}>
              <i className="fas fa-sparkles"></i> AI Tasks
            </button>
            <button onClick={() => setView('calendar')} className={view === 'calendar' ? 'active' : ''}>
              <i className="fas fa-calendar"></i> Calendar
            </button>
          </div>
        </div>
        
        <div className="top-bar-right">
          <span className="settings-gear" onClick={() => setShowSettings(true)}>
            <i className="fa fa-gear"></i>
          </span>
        </div>
      </div>

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
              
              <form className="update-form" onSubmit={handlePasswordChange}>
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
          </div>
        </div>
      )}

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      {/* AI DAILY TASKS VIEW */}
      {view === 'task' && (
        <div className="task-prompt-view">
          {/* Collapsible Prompt Header */}
          {isPromptCollapsed ? (
            <div className="collapsed-prompt-section">
              <div className="collapsed-prompt-header">
                <h3>Today's Focus</h3>
              </div>
              <div className="collapsed-prompt" onClick={() => setIsPromptCollapsed(false)}>
                <i className="fas fa-sparkles"></i>
                <span>Generate new daily tasks</span>
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
          ) : (
            <>
              <div className="prompt-header">
                <h2>What do you want to accomplish today?</h2>
                <p>Tell me your goals and I'll create a personalized daily task list</p>
              </div>

              <div className="prompt-container">
                <textarea
                  value={taskPrompt}
                  onChange={(e) => setTaskPrompt(e.target.value)}
                  placeholder="E.g., I need to finish the client presentation, work out for 30 minutes, and review the marketing strategy..."
                  className="prompt-textarea"
                />
                <button
                  onClick={handleGenerateTasks}
                  disabled={!taskPrompt || isGenerating}
                  className="generate-button"
                >
                  <i className="fas fa-sparkles"></i>
                  {isGenerating ? 'Generating...' : 'Generate Daily Tasks'}
                </button>
              </div>
              
              <button 
                className="minimize-button" 
                onClick={() => setIsPromptCollapsed(true)}
                title="Minimize"
              >
                <i className="fas fa-chevron-up"></i>
              </button>
            </>
          )}

          {/* Active Daily Tasks Section */}
          <div className="todays-tasks">
            <div className="todays-tasks-header">
              <h3>Active Daily Tasks</h3>
              {getActiveDailyTasks().length > 0 && (
                <button 
                  className={`edit-tasks-button ${isEditingDailyTasks ? 'save-mode' : ''}`}
                  onClick={handleEditDailyTasks}
                >
                  <i className={`fas fa-${isEditingDailyTasks ? 'save' : 'edit'}`}></i>
                  {isEditingDailyTasks ? 'Save Tasks' : 'Edit Tasks'}
                </button>
              )}
            </div>
            {getActiveDailyTasks().map(task => (
              <div key={task._id} className="task-card" style={{ borderLeft: `4px solid ${task.color}` }}>
                <div className="task-info">
                  {isEditingDailyTasks ? (
                    <>
                      <input
                        type="text"
                        value={editedDailyTasks[task._id]?.title || task.title}
                        onChange={(e) => handleEditedTaskChange(task._id, 'title', e.target.value)}
                        className="task-edit-input"
                        placeholder="Task title"
                      />
                      <textarea
                        value={editedDailyTasks[task._id]?.details || task.details}
                        onChange={(e) => handleEditedTaskChange(task._id, 'details', e.target.value)}
                        className="task-edit-textarea"
                        placeholder="Task details"
                      />
                    </>
                  ) : (
                    <>
                      <h4>{task.title}</h4>
                      <p>{task.details}</p>
                    </>
                  )}
                </div>
                {!isEditingDailyTasks && (
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleToggleDailyTask(task._id)}
                    className="task-checkbox"
                  />
                )}
              </div>
            ))}
            {getActiveDailyTasks().length === 0 && (
              <p className="no-tasks">No daily tasks yet. Generate some above!</p>
            )}
          </div>

          {/* Completed Daily Tasks Section */}
          {getCompletedDailyTasks().length > 0 && (
            <div className="completed-tasks">
              <h3>Completed</h3>
              {getCompletedDailyTasks().map(task => (
                <div key={task._id} className="task-card completed-task-card" style={{ borderLeft: `4px solid ${task.color}` }}>
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>{task.details}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => handleToggleDailyTask(task._id)}
                    className="task-checkbox"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div className="calendar-view">
          {/* Sidebar */}
          <div className="calendar-sidebar">
            {/* Add Task Button */}
            <button onClick={() => setShowAddTask(true)} className="sidebar-add-button">
              <i className="fas fa-plus"></i> New Task
            </button>

            {/* Mini Calendar */}
            <div className="mini-calendar">
              <div className="mini-calendar-header">
                <h3>{miniCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <div className="mini-nav-buttons">
                  <button onClick={() => changeMiniMonth(-1)} className="mini-nav-button">
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button onClick={() => changeMiniMonth(1)} className="mini-nav-button">
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              <div className="mini-calendar-grid">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="mini-day-header">{day}</div>
                ))}
                {getMiniCalendarDays().map((day, index) => {
                  const isCurrentMonth = day.getMonth() === miniCalendarMonth.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = day.toDateString() === selectedMiniDay.toDateString();
                  const hasTasks = getTasksForDate(day).length > 0;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleMiniDayClick(day)}
                      className={`mini-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasTasks ? 'has-tasks' : ''}`}
                    >
                      {day.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Tasks */}
            <div className="sidebar-tasks">
              <h4>{selectedMiniDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h4>
              {getSelectedDayTasks().length > 0 ? (
                getSelectedDayTasks().map(task => (
                  <div 
                    key={task._id} 
                    className="sidebar-task-item"
                    style={{ borderLeftColor: task.color }}
                    onClick={() => setViewingTask(task)}
                  >
                    <div className="sidebar-task-content">
                      <div className="sidebar-task-title">{task.title}</div>
                      {task.details && <div className="sidebar-task-details">{task.details}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="sidebar-no-tasks">No tasks</div>
              )}
            </div>
          </div>

          {/* Main Calendar */}
          <div className="calendar-main">
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDate(day);
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    onClick={() => handleMiniDayClick(day)}
                    className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  >
                    <div className="day-number">{day.getDate()}</div>
                    <div className="day-tasks">
                      {Array.isArray(calendarTasks) && dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task._id}
                          className="task-indicator"
                          style={{ backgroundColor: task.color }}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="more-tasks">+{dayTasks.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Calendar Task Modal */}
      {showAddTask && (
        <div className="modal-overlay" onClick={() => setShowAddTask(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Calendar Task</h3>
              <button onClick={() => setShowAddTask(false)} className="close-button">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="modal-input"
            />
            <textarea
              placeholder="Description"
              value={newTask.details}
              onChange={(e) => setNewTask({ ...newTask, details: e.target.value })}
              className="modal-textarea"
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="modal-input"
            />
            <input
              type="color"
              value={newTask.color}
              onChange={(e) => setNewTask({ ...newTask, color: e.target.value })}
              className="modal-color"
            />
            {errorMessage && <div className="error">{errorMessage}</div>}
            <button onClick={handleAddTask} className="create-button">
              Add Task
            </button>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {viewingTask && (
        <div className="modal-overlay" onClick={() => setViewingTask(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Task Details</h3>
              <button onClick={() => setViewingTask(null)} className="close-button">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="task-view-content">
              <div className="task-view-color" style={{ backgroundColor: viewingTask.color }}></div>
              <h2 className="task-view-title">{viewingTask.title}</h2>
              {viewingTask.details && (
                <p className="task-view-details">{viewingTask.details}</p>
              )}
              <p className="task-view-date">
                {new Date(viewingTask.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="task-view-actions">
              <button 
                onClick={() => {
                  setEditingTask(viewingTask);
                  setViewingTask(null);
                }} 
                className="edit-task-button"
              >
                <i className="fas fa-edit"></i> Edit Task
              </button>
              <button 
                onClick={() => handleDeleteTask(viewingTask._id)} 
                className="delete-task-button"
              >
                <i className="fas fa-trash"></i> Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button onClick={() => setEditingTask(null)} className="close-button">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <input
              type="text"
              placeholder="Task Title"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              className="modal-input"
            />
            <textarea
              placeholder="Description"
              value={editingTask.details}
              onChange={(e) => setEditingTask({ ...editingTask, details: e.target.value })}
              className="modal-textarea"
            />
            <input
              type="date"
              value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
              className="modal-input"
            />
            <input
              type="color"
              value={editingTask.color}
              onChange={(e) => setEditingTask({ ...editingTask, color: e.target.value })}
              className="modal-color"
            />
            {errorMessage && <div className="error">{errorMessage}</div>}
            <button onClick={handleEditTask} className="create-button">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Task;
