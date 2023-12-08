const express = require('express')
const {
    getProjects,
    getProject,
    createProject,
    deleteProject,
    updateProject,
} = require('../controllers/projectController')
const requireAuth = require('../middleware/requireAuth')


const router = express.Router()

// require auth for all routes
router.use(requireAuth)

// Get all user tasks
router.get('/', getProjects)

// Get one user task
router.get('/:id', getProject)

// Post new task
router.post('/', createProject)

// Delete a task
router.delete('/:id', deleteProject)

// Update a task
router.patch('/:id', updateProject);

module.exports = router