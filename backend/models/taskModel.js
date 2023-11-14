const mongoose = require('mongoose')

const Schema = mongoose.Schema

const scheduleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 150
    },
    timer: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/  // Regex to match the ISO format
    },
    secondsLeft: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    paused: {
        type: Boolean,
        default: false
    },
    pauseStartTime: {
        type: Date,
        default: null
    },
    user_id: {
        type: String,
        required: true
    },
    lastUpdateTime: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Task', scheduleSchema)