import React, { useState } from 'react';
import Draggable from 'react-draggable';
import './taskForm.css';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTheme } from '../ThemeContext';

const TaskForm = ({ onAddTask, closeForm, editTitle = "", editDueTime = "", editDescription = "", isEditing = false }) => {
    const [title, setTitle] = useState(editTitle);
    const [dueTime, setDueTime] = useState(editDueTime || '');
    const [description, setDescription] = useState(editDescription);
    const { darkMode } = useTheme();

    const { user } = useAuthContext()


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if the user is logged in
        if (!user) {
            console.error('You must be logged in');
            return;
        }

        // Calculate the difference between the selected time and the current time in seconds
        const selectedDate = new Date(dueTime);
        const now = new Date();
        const secondsLeft = Math.floor((selectedDate - now) / 1000);
        const dueDate = selectedDate.toISOString();  // Convert the date to a string


        if (isNaN(secondsLeft) || secondsLeft <= 0) {
            console.error('Invalid secondsLeft value');
            alert('Please enter a valid future date and time.');
            return;
        }

        console.log("Title:", title);
        console.log("Due Time:", dueTime);
        console.log("Description:", description);
        console.log("User ID:", user ? user.token : "User not logged in");


        // Prepare the task object
        const newTask = {
            title: title,
            desc: description,
            timer: `${dueTime}:00`,  // You may want to update this based on how you use it in the backend
            dueDate: dueDate,  
            paused: false,  
            pauseStartTime: null, 
            secondsLeft: secondsLeft,
            user_id: user.token,
            type: "YourTaskTypeHere"  // Add the type field here
        };

        console.log("Data being sent to the server:", newTask);


        try {
            const apiUrl = `https://quantumix.onrender.com/api/tasks${isEditing ? `/${editTitle}` : ''}`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(apiUrl, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });

            const responseData = await response.json();

            if (response.ok) {
                // If the task is successfully created, use the response data
                // Assuming the API returns the created task, including its ID
                onAddTask(responseData);
                // Close the form after task is added
                closeForm();
            } else {
                console.error('Failed to create task:', responseData);
                alert('Failed to create task. Please try again.');
            }
        } catch (err) {
            console.error('An error occurred while creating the task:', err);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <Draggable handle=".task-form-header">
            <div className={`task-form-container ${darkMode ? 'dark-task-container' : ''}`}>
                <div className={`task-form ${darkMode ? 'dark-task-form' : ''}`}>
                    <div className={`task-form-header ${darkMode ? 'dark-task-form-header' : ''}`}>
                        <button className="close-button" onClick={closeForm}>
                            X
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            required
                        />
                        <label htmlFor="dueTime">Due Date</label>
                        <input
                            type="datetime-local"
                            id="dueTime"
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                            required
                        />
                        <textarea
                            id="description"
                            value={description}
                            placeholder="Description"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <button type="submit">{isEditing ? "Save" : "Create Task"}</button>
                    </form>
                </div>
            </div>
        </Draggable>
    );
};

export default TaskForm;
