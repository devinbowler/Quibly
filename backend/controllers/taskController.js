const Task = require('../models/taskModel')
const mongoose = require('mongoose')

// Get all tasks
const getTasks = async (req, res) => {
    const user_id = req.user._id;
    try {
        const tasks = await Task.find({ user_id });
        const categorizedTasks = {
            inProgress: [],
            working: [],
            completed: []
        };
        tasks.forEach(task => {
            categorizedTasks[task.status].push(task);
        });
        res.status(200).json(categorizedTasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).send("Internal Server Error");
    }
};
  

// Get one event
const getTask = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid task' })
    }

    const task = await Task.findById(id)

    if (!task) {
        return res.status(404).json({ error: 'No task found' })
    }

    res.status(200).json(task)
}

// Create a new task
const createTask = async (req, res) => {
    console.log("Incoming request body:", req.body);  // Debug print
    const { title, desc, timer, secondsLeft, dueDate, paused, pauseStartTime, user_id, lastUpdateTime, tags } = req.body;

    try {
        if (isNaN(secondsLeft) || secondsLeft <= 0) {
            return res.status(400).json({ error: 'Invalid secondsLeft value' });
        }

        const paused = false;
        const pauseStartTime = null;

        const user_id = req.user._id;
        const tags = req.body.tags || [];
        const task = await Task.create({ title, desc, timer, secondsLeft, dueDate, paused, pauseStartTime, user_id, lastUpdateTime, tags });
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a event
const deleteTask = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid task' })
    }

    const task = await Task.findOneAndDelete({ _id: id })

    if (!task) {
        return res.status(404).json({ error: 'No task found' })
    }
    console.log(task)
    res.status(200).json(task)
}

// Update a event
const updateTask = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Invalid task' });
    }
  
    const task = await Task.findOneAndUpdate({ _id: id }, {
      ...req.body
    }, { new: true }); // { new: true } will return the updated document
  
    if (!task) {
      return res.status(404).json({ error: 'No task found' });
    }
  
    res.status(200).json(task);
  };

  const updateTaskType = async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid task' });
    }

    const task = await Task.findOneAndUpdate({ _id: id }, { type }, { new: true });

    if (!task) {
        return res.status(404).json({ error: 'No task found' });
    }

    res.status(200).json(task);
};


const resumeTask = async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    task.lastUpdateTime = new Date();
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

    const now = new Date();
    const timeElapsed = (now - task.lastUpdateTime) / 1000;
    task.secondsLeft = Math.max(0, task.secondsLeft - timeElapsed);
    task.paused = true;
    task.pauseStartTime = now;
    task.lastUpdateTime = now;
    await task.save();
    res.status(200).json(task);
};



module.exports = {
    getTasks,
    getTask,
    createTask,
    deleteTask,
    updateTask,
    updateTaskType,
    resumeTask,
    pauseTask
}
