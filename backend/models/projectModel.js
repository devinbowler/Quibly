const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  user_id: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Project', projectSchema);
