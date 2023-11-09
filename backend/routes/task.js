const express = require('express')
const {
    getTasks,
    getTask,
    createTask,
    deleteTask,
    updateTask,
    resumeTask,
    pauseTask
} = require('../controllers/taskController')
const requireAuth = require('../middleware/requireAuth')

const Event = require('../models/taskModel')

const router = express.Router()

// require auth for all routes
router.use(requireAuth)

// Get all user tasks
router.get('/', getTasks)

// Get one user task
router.get('/:id', getTask)

// Post new task
router.post('/', createTask)

// Delete a task
router.delete('/:id', deleteTask)

// Update a task
router.patch('/:id', updateTask)

router.patch('/:id', pauseTask);

router.patch('/:id', resumeTask);

module.exports = router