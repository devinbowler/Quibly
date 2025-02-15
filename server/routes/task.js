// routes/task.js
const express = require('express');
const {
  getAllItems,
  createFolder,
  createTask,
  createNote,
  deleteItem,
  updateTask,
  updateNote,
  getNoteDetails,
  updateFolder, // Import updateFolder
} = require('../controllers/taskController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

// Get all items (tasks, notes, folders)
router.get('/', getAllItems);

// Fetch note details by ID
router.get('/note/:id', getNoteDetails);

// Create a folder, task, or note
router.post('/folder', createFolder);
router.post('/task', createTask);
router.post('/note', createNote);

// Delete an item (folder, task, or note)
router.delete('/:id/:type', deleteItem);

// Update a task or note
router.patch('/task/:id', updateTask);
router.patch('/note/:id', updateNote);

// Update a folder
router.patch('/folder/:id', updateFolder);

module.exports = router;