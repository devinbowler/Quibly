const DailyTask = require('../models/dailyTaskModel');
const mongoose = require('mongoose');

// Get all daily tasks for the authenticated user
const getAllDailyTasks = async (req, res) => {
  const user_id = req.user._id;

  try {
    const tasks = await DailyTask.find({ user_id }).sort({ dueDate: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create multiple daily tasks (for AI generation)
// This will DELETE all existing daily tasks first, then create new ones
const createMultipleDailyTasks = async (req, res) => {
  const { tasks } = req.body;
  const user_id = req.user._id;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: 'Tasks array is required' });
  }

  try {
    // IMPORTANT: Delete all existing daily tasks for this user first
    await DailyTask.deleteMany({ user_id });

    // Create new daily tasks
    const tasksToCreate = tasks.map(task => ({
      ...task,
      user_id,
      dueDate: new Date(task.dueDate),
      color: task.color || '#495BFA',
      completed: 'false',
      details: task.details || task.description || ''
    }));

    const createdTasks = await DailyTask.insertMany(tasksToCreate);
    res.status(201).json(createdTasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Toggle daily task completion
const toggleDailyTaskCompletion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Invalid task ID' });
  }

  try {
    const task = await DailyTask.findOne({ _id: id, user_id: req.user._id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = task.completed === 'true' ? 'false' : 'true';
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete all daily tasks for the user
const deleteAllDailyTasks = async (req, res) => {
  const user_id = req.user._id;

  try {
    await DailyTask.deleteMany({ user_id });
    res.status(200).json({ message: 'All daily tasks deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllDailyTasks,
  createMultipleDailyTasks,
  toggleDailyTaskCompletion,
  deleteAllDailyTasks
};
