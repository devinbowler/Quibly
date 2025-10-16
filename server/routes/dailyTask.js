const express = require('express');
const {
  getAllDailyTasks,
  createMultipleDailyTasks,
  toggleDailyTaskCompletion,
  deleteAllDailyTasks,
  updateDailyTask
} = require('../controllers/dailyTaskController');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all daily tasks
router.get('/', getAllDailyTasks);

// Create multiple daily tasks (for AI generation)
router.post('/batch', createMultipleDailyTasks);

// Update a daily task
router.patch('/:id', updateDailyTask);

// Toggle daily task completion
router.patch('/:id/toggle', toggleDailyTaskCompletion);

// Delete all daily tasks
router.delete('/', deleteAllDailyTasks);

module.exports = router;
