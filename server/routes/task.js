const express = require('express');
const {
    getAllItems,
    createFolder,
    createTask,
    createNote,
    deleteItem,
    updateTask,
    updateNote,
    getNoteDetails, // Import the new controller function
} = require('../controllers/taskController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

// Get all items (tasks, notes, folders)
router.get('/', getAllItems);

// Add this route to fetch note details by ID
router.get('/note/:id', getNoteDetails);

// Create a folder, task, or note
router.post('/folder', createFolder);
router.post('/task', createTask);
router.post('/note', createNote);

// Delete an item
router.delete('/:id/:type', deleteItem);  // :type can be 'folder', 'task', or 'note'

// Update a task or note
router.patch('/task/:id', updateTask);
router.patch('/note/:id', updateNote);

module.exports = router;
