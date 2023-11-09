const Task = require('../models/taskModel')
const mongoose = require('mongoose')

// Get all tasks
const getTasks = async (req, res) => {
    const user_id = req.user._id

    
    try {
        const tasks = await Task.find({ user_id })
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).send("Internal Server Error");
    }

    res.status(200).json(tasks)
}

// Get one event
const getTask = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid task'})
    }

    const task = await Task.findById(id)

    if (!task) {
        return res.status(404).json({error: 'No task found'})
    }

    res.status(200).json(task)
}

// Create a new task
const createTask = async (req, res) => {
    console.log("Incoming request body:", req.body);  // Debug print
    const {title, desc, timer, secondsLeft, type, dueDate, paused, pauseStartTime, user_id} = req.body;

    try {
        if (isNaN(secondsLeft) || secondsLeft <= 0) {
            return res.status(400).json({ error: 'Invalid secondsLeft value' });
        }

        const paused = false;
        const pauseStartTime = null;

        const user_id = req.user._id;
        const task = await Task.create({title, desc, timer, secondsLeft, type, dueDate, paused, pauseStartTime, user_id});
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Delete a event
const deleteTask = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid task'})
    }

    const task = await Task.findOneAndDelete({_id: id})

    if (!task) {
        return res.status(404).json({error: 'No task found'})
    }

    res.status(200).json(task)
}

// Update a event
const updateTask = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid task'})
    }

    const task = await Task.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if (!task) {
        return res.status(404).json({error: 'No task found'})
    }

    res.status(200).json(task)
}

const resumeTask = async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    const pauseDuration = new Date() - task.pauseStartTime;
    task.dueDate = new Date(task.dueDate.getTime() + pauseDuration);
    task.paused = false;
    task.pauseStartTime = null;
    await task.save();
    res.status(200).json(task);
};


const pauseTask = async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    task.paused = true;
    task.pauseStartTime = new Date();
    await task.save();
    res.status(200).json(task);
};


module.exports = {
    getTasks,
    getTask,
    createTask,
    deleteTask,
    updateTask,
    resumeTask,
    pauseTask
}