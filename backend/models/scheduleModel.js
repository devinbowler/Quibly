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
    color: {
        type: String,
        required: true,
        match: /^#(?:[0-9a-fA-F]{3}){1,2}$/   // Regex to ensure a valid hex color
    },
    startT: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/  // Regex to match the ISO format
    },
    endT: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
    },
    user_id: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Event', scheduleSchema)