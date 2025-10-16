const express = require('express');
const { generateTasksFromPrompt } = require('../controllers/aiController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Generate tasks from AI prompt
router.post('/generate-tasks', generateTasksFromPrompt);

module.exports = router;
