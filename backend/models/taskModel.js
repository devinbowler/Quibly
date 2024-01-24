const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Update the taskSchema to include tags
const taskSchema = new Schema({
  status: {
    type: String,
    enum: ['inProgress', 'working', 'completed'],
    default: 'inProgress'
  },
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
  },
  tags: [{
    name: {
      type: String,
      trim: true,
      maxlength: 50
    },
    color: {
      type: String,
      trim: true,
      match: /^#([0-9a-f]{3}){1,2}$/i // Regex for hex color codes
    }
  }] 
});

module.exports = mongoose.model('Task', taskSchema);
