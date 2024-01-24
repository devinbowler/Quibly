const Event = require('../models/scheduleModel')
const mongoose = require('mongoose')

// Get all events
const getEvents = async (req, res) => {
    const user_id = req.user._id

    const events = await Event.find({ user_id })

    res.status(200).json(events)
}

// Get one event
const getEvent = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid event'})
    }

    const event = await Event.findById(id)

    if (!event) {
        return res.status(404).json({error: 'No event found'})
    }

    res.status(200).json(event)
}

// Create a new event
const createEvent = async (req, res) => {
    const {title, desc, color, startT, endT} = req.body

    try {
        const user_id = req.user._id
        const event = await Event.create({title, desc, color, startT, endT, user_id})
        res.status(200).json(event)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// Delete a event
const deleteEvent = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid event'})
    }

    const event = await Event.findOneAndDelete({_id: id})

    if (!event) {
        return res.status(404).json({error: 'No event found'})
    }

    res.status(200).json(event)
}

// Update a event
const updateEvent = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid event'})
    }

    const event = await Event.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if (!event) {
        return res.status(404).json({error: 'No event found'})
    }

    res.status(200).json(event)
}

module.exports = {
    getEvents,
    getEvent,
    createEvent,
    deleteEvent,
    updateEvent
}