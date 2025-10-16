const Task = require('../models/taskModel');
const mongoose = require('mongoose');

// Get all tasks for the authenticated user
const getAllTasks = async (req, res) => {
  const user_id = req.user._id;

  try {
    const tasks = await Task.find({ user_id }).sort({ dueDate: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tasks for a specific date range (for calendar view)
const getTasksByDateRange = async (req, res) => {
  const user_id = req.user._id;
  const { startDate, endDate } = req.query;

  try {
    const tasks = await Task.find({
      user_id,
      dueDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ dueDate: 1 });
    
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  const { title, details, dueDate, color } = req.body;
  const user_id = req.user._id;

  if (!title || !dueDate) {
    return res.status(400).json({ error: 'Title and due date are required' });
  }

  try {
    const task = await Task.create({
      title,
      details: details || '',
      dueDate: new Date(dueDate),
      color: color || '#495BFA',
      completed: 'false',
      user_id
    });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create multiple tasks (for AI-generated tasks)
const createMultipleTasks = async (req, res) => {
  const { tasks } = req.body;
  const user_id = req.user._id;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: 'Tasks array is required' });
  }

  try {
    const tasksToCreate = tasks.map(task => ({
      ...task,
      user_id,
      dueDate: new Date(task.dueDate),
      color: task.color || '#495BFA',
      completed: 'false',
      details: task.details || task.description || '' // Support both for API flexibility
    }));

    const createdTasks = await Task.insertMany(tasksToCreate);
    res.status(201).json(createdTasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Invalid task ID' });
  }

  try {
    const updateData = { ...req.body, lastUpdateTime: Date.now() };
    
    // Support both details and description for flexibility
    if (updateData.description && !updateData.details) {
      updateData.details = updateData.description;
      delete updateData.description;
    }
    
    const task = await Task.findOneAndUpdate(
      { _id: id, user_id: req.user._id },
      updateData,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Invalid task ID' });
  }

  try {
    const task = await Task.findOneAndDelete({
      _id: id,
      user_id: req.user._id
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle task completion
const toggleTaskCompletion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Invalid task ID' });
  }

  try {
    const task = await Task.findOne({ _id: id, user_id: req.user._id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = task.completed === 'true' ? 'false' : 'true';
    task.lastUpdateTime = Date.now();
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTasks,
  getTasksByDateRange,
  createTask,
  createMultipleTasks,
  updateTask,
  deleteTask,
  toggleTaskCompletion
};
