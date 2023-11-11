import React, { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import './Tasks.css';
import { useAuthContext } from '../hooks/useAuthContext'; 

const TaskItem = ({ 
    title, 
    dueDate, 
    description, 
    totalTime, 
    timeLeft, 
    togglePause, 
    pausedTask, 
    hovering, 
    setHovering, 
    handleEditTask,
    taskId,
    handleDelete,
    showDeleteModal,
    setShowDeleteModal,
    setTaskIdMarkedForDeletion
}) => {
    const visualCap = 0.81;
    const progressPercentage = ((Number(timeLeft) / Number(totalTime)) * 100 * Number(visualCap)).toFixed(2);;



    const seconds = Math.floor(timeLeft % 60);
    const minutes = Math.floor((timeLeft / 60) % 60);
    const hours = Math.floor((timeLeft / 3600) % 24);
    const days = Math.floor(timeLeft / 86400);

    
    // // console.log("Progress Percentage:", progressPercentage);
    // // console.log("Time Left:", timeLeft);
    // // console.log("Total Time:", totalTime);
    // // console.log("Visual Cap:", visualCap);

    

    const timeDisplay = timeLeft >= 0 
        ? `${days}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : 'Invalid Time';

        const handleMarkForDeletion = (taskId) => {
            // Set the task ID that is marked for deletion
            setTaskIdMarkedForDeletion(taskId);
            // Show the delete modal
            setShowDeleteModal(true);
          };
          

    return (
        <div className="task-card">
            <div className="task-header">
                <div className="task-description-container">
                    <div className="task-title">{title}</div>
                    <div className="task-description">
                        {description}
                        <div className="circle-container">
                            <svg className="circle-progress" viewBox="0 0 36 36">
                                <path className="circle-bg"
                                    d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                <path className="circle"
                                    stroke-dasharray={`${progressPercentage}, 100`}
                                    d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            </svg>
                            <div 
                                className="timeLeft" 
                                onMouseEnter={() => setHovering(true)}
                                onMouseLeave={() => setHovering(false)}
                                onClick={() => togglePause(title, timeLeft)}
                            >
                                {!hovering ? timeDisplay : (pausedTask === title ? '▶' : '❚❚')}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="icon-container">
                    <div onClick={() => handleMarkForDeletion(taskId)} className="delete-button">🗑️</div>
                    <div onClick={() => handleEditTask(title, dueDate, description)} className="options">•••</div>
                </div>
            </div>
        </div>
    );
}


const Tasks = () => {
    const [taskIdMarkedForDeletion, setTaskIdMarkedForDeletion] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState('Single');
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDueTime, setEditDueTime] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [tasks, setTasks] = useState([]);
    const [pausedTask, setPausedTask] = useState(null);
    const [storedTimeLeft, setStoredTimeLeft] = useState(null);
    const [hovering, setHovering] = useState(false);

    const handleDelete = async () => {
        if (!user || !taskIdMarkedForDeletion) {
            // console.log("User not logged in or no task marked for deletion");
            return;
        }
        
        // console.log("Task ID marked for deletion:", taskIdMarkedForDeletion);
    
        const response = await fetch(`https://quantumix.onrender.com/api/tasks/${taskIdMarkedForDeletion}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
    
        const responseData = await response.json();
    
        // console.log("API Response:", responseData);
    
        if (response.ok) {
            setTasks(prevTasks => prevTasks.filter(t => t._id !== taskIdMarkedForDeletion));
            setShowDeleteModal(false); 
            setTaskIdMarkedForDeletion(null);  // Reset it
        } else {
            // console.log("Failed to delete the task.");
        }
    };
    
    
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);

        // Get the first tab item to calculate its dimensions
        const tabItem = document.querySelector('.tab-item');
        const tabItemWidth = tabItem.offsetWidth;
        const tabItemStyle = window.getComputedStyle(tabItem);
        const tabItemMargin = parseFloat(tabItemStyle.marginLeft) + parseFloat(tabItemStyle.marginRight);

        // Get the index of the clicked tab
        const tabIndex = ['Single', 'Routine', 'Project'].indexOf(tabName);

        // Calculate the new left position for the ::before pseudo-element
        const newLeftPosition = tabIndex * (tabItemWidth + tabItemMargin);

        // Apply a specific adjustment for the "Project" tab
        let adjustment = 0;
        if (tabName === 'Project') {
            adjustment = 10;  // Adjust this value based on your specific case
        }

        if (tabName === 'Single') {
            adjustment = -4;  // Adjust this value based on your specific case
        }


        if (tabName === 'Routine') {
            adjustment = 2;  // Adjust this value based on your specific case
        }

        // Calculate the adjusted position
        const adjustedPosition = newLeftPosition + adjustment;

        // Get the tab container and set the new left position for the ::before pseudo-element
        const tabContainer = document.querySelector('.tab-container');
        tabContainer.style.setProperty('--before-left', `${adjustedPosition}px`);
    };

    const handleEditTask = (title, dueDate, description) => {
        setIsEditing(true);
        setEditTitle(title);
        
        // Convert the timestamp to the required format for input
        const date = new Date(dueDate);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        setEditDueTime(formattedDate);
        setEditDescription(description);
        setShowForm(true);
    };
    
    const addTask = (title, dueDateTime, description) => {
        const dueDate = new Date(dueDateTime).getTime();
        const nowTime = new Date().getTime();
        const totalTime = (dueDate - nowTime) / 1000;
        const secondsLeft = Math.floor((dueDate - nowTime) / 1000);
        
        // console.log("Calculated Total Time:", totalTime);
        
        if (isEditing) {
            setTasks(prevTasks => prevTasks.map(task => {
                if (task.title === editTitle) {
                    return {
                        title,
                        dueDate,
                        description,
                        totalTime, // <-- Add this line
                        secondsLeft
                    };
                }
                return task;
            }));
            setIsEditing(false);
        } else {
            const newTask = { 
                title, 
                dueDate, 
                description, 
                totalTime, // <-- Add this line
                secondsLeft
            };
            setTasks([...tasks, newTask]);
        }
    };

const togglePause = async (taskTitle, timeLeft) => {
    if (pausedTask === taskTitle) {
        // Resume logic
        // Send a PATCH request to the '/resume/:taskId' endpoint
        // Update the task in the state to set `paused` to false and adjust the `dueDate` and `timeLeft`
        const response = await fetch(`https://quantumix.onrender.com/api/tasks/resume/${taskTitle}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        
        // Handle response and update state
        if (response.ok) {
            setPausedTask(null);
            // Fetch tasks again or adjust timeLeft based on the response
        }
    } else {
        // Pause logic
        // Send a PATCH request to the '/pause/:taskId' endpoint
        const response = await fetch(`https://quantumix.onrender.com/api/tasks/pause/${taskTitle}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        
        // Handle response and update state
        if (response.ok) {
            setPausedTask(taskTitle);
            setStoredTimeLeft(timeLeft);
            // Fetch tasks again or adjust timeLeft based on the response
        }
    }
};


    const {user} = useAuthContext()

    useEffect(() => {
        const fetchTasks = async () => {
            // console.log("Running fetchTasks effect.");
    
            // Debug: Manually set a task to see if the issue is with fetching or rendering
            const debugTask = {
                _id: 'debug123',
                title: 'Debug Task',
                dueDate: new Date().toISOString(),
                description: 'This is a debug task',
                totalTime: 5000,
                secondsLeft: 3000,
                type: 'Single' // Make sure this matches one of your tabs
            };
            setTasks([debugTask]);
            
            try {
                const response = await fetch('https://quantumix.onrender.com/api/tasks', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
    
                if (!response.ok) {
                    // console.log("Failed to fetch: ", response.status);
                    return;
                }
    
                const json = await response.json();
                // console.log("Tasks fetched: ", json);
    
                // Explicitly create a new array of objects to ensure React recognizes the change
                const updatedTasks = json.map(task => ({ ...task }));
                setTasks(updatedTasks);
                
            } catch (error) {
                // console.log("An error occurred: ", error);
            }
        };
    
        if (user) {
            fetchTasks();
        }
    
        // Interval to update the `secondsLeft` for each task
        const interval = setInterval(() => {
            setTasks(prevTasks => prevTasks.map(task => {
                let newSecondsLeft = task.secondsLeft;
                // If the task is paused, don't decrease its secondsLeft
                if (task.title === pausedTask) {
                    newSecondsLeft = storedTimeLeft;
                } else if (task.secondsLeft > 0) {
                    newSecondsLeft -= 1;
                } else {
                    newSecondsLeft = 0;
                }
                // Explicitly set a new object to trigger a re-render
                return {...task, secondsLeft: newSecondsLeft};
            }));
        }, 1000);
    
        // Cleanup: clear the interval when the component unmounts
        return () => clearInterval(interval);
    }, [pausedTask, storedTimeLeft, user]);
    

    return (
        <div className="taskPage">
            {/* Tab Container */}
            <div className="tab-container">
                <div 
                    className={`tab-item ${activeTab === 'Single' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('Single')}
                >
                    Single
                </div>
                <div 
                    className={`tab-item ${activeTab === 'Routine' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('Routine')}
                >
                    Routine
                </div>
                <div 
                    className={`tab-item ${activeTab === 'Project' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('Project')}
                >
                    Project
                </div>
            </div>
            
            {/* Task Form */}
            {showForm && <TaskForm 
                onAddTask={addTask} 
                closeForm={() => {
                    setShowForm(false);
                    setIsEditing(false);
                }} 
                editTitle={editTitle} 
                editDueTime={editDueTime} 
                editDescription={editDescription} 
                isEditing={isEditing} 
            />}

            {/* Task List */}
            <div className="taskList">
            {tasks.filter(task => task.type === activeTab).map(task => (
                    <TaskItem 
                        handleEditTask={handleEditTask}
                        key={task._id}
                        title={task.title}
                        dueDate={task.dueDate}
                        description={task.description}
                        totalTime={task.totalTime}
                        timeLeft={task.secondsLeft}  // <-- Here
                        togglePause={togglePause}
                        pausedTask={pausedTask}
                        hovering={hovering}
                        setHovering={setHovering}
                        handleDelete={() => handleDelete(task._id)}
                        taskId={task._id}
                        showDeleteModal={showDeleteModal}
                        setShowDeleteModal={setShowDeleteModal}
                        setTaskIdMarkedForDeletion={setTaskIdMarkedForDeletion}
                    />
                ))}
            </div>

            {/* Floating Button */}
            <button className="floatingButton" onClick={() => setShowForm(true)}>
            New Task
            </button>

            {/* Add this code here for the Delete Modal */}
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
    );
};

export default Tasks;
