const express = require('express');
const {
    getAllItems,
    createFolder,
    createTask,
    createNote,
    deleteItem,
    updateTask,
    updateNote
} = require('../controllers/taskController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

// Get all items (tasks, notes, folders)
router.get('/', getAllItems);

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
