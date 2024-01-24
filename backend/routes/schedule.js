const express = require('express')
const {
    getEvents,
    getEvent,
    createEvent,
    deleteEvent,
    updateEvent
} = require('../controllers/scheduleController')
const requireAuth = require('../middleware/requireAuth')

const Event = require('../models/scheduleModel')

const router = express.Router()

// require auth for all routes
router.use(requireAuth)

// Get all user events
router.get('/', getEvents)

// Get one user event
router.get('/:id', getEvent)

// Post new event
router.post('/', createEvent)

// Delete a event
router.delete('/:id', deleteEvent)

// Update a event
router.patch('/:id', updateEvent)

module.exports = router