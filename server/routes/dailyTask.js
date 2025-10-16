const express = require('express');
const {
  getAllDailyTasks,
  createMultipleDailyTasks,
  toggleDailyTaskCompletion,
  deleteAllDailyTasks
} = require('../controllers/dailyTaskController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all daily tasks
router.get('/', getAllDailyTasks);

// Create multiple daily tasks (replaces existing ones)
router.post('/batch', createMultipleDailyTasks);

// Toggle daily task completion
router.patch('/:id/toggle', toggleDailyTaskCompletion);

// Delete all daily tasks
router.delete('/all', deleteAllDailyTasks);

module.exports = router;
