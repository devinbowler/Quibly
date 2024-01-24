const express = require('express')
const {
    getTasks,
    getTask,
    createTask,
    deleteTask,
    updateTask,
    updateTaskType,
    resumeTask,
    pauseTask
} = require('../controllers/taskController')
const requireAuth = require('../middleware/requireAuth')


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
router.patch('/:id', updateTask);

// Update task type
router.put('/:id/updateType', updateTaskType);

router.patch('/:id', pauseTask);

router.patch('/:id', resumeTask);

module.exports = router