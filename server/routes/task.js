const express = require('express');
const {
  getAllTasks,
  getTasksByDateRange,
  createTask,
  createMultipleTasks,
  updateTask,
  deleteTask,
  toggleTaskCompletion
} = require('../controllers/taskController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all tasks
router.get('/', getAllTasks);

// Get tasks by date range (for calendar)
router.get('/range', getTasksByDateRange);

// Create a single task
router.post('/', createTask);

// Create multiple tasks (for AI generation)
router.post('/batch', createMultipleTasks);

// Update a task
router.patch('/:id', updateTask);

// Toggle task completion
router.patch('/:id/toggle', toggleTaskCompletion);

// Delete a task
router.delete('/:id', deleteTask);

module.exports = router;
