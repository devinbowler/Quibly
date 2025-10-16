const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  color: { type: String, default: '#495BFA' },
  details: { type: String, default: '' },
  completed: { type: String, default: 'false' },
  user_id: { type: String, required: true },
  lastUpdateTime: { type: Date, default: Date.now }
});

// Update the lastUpdateTime field on save
taskSchema.pre('save', function(next) {
  this.lastUpdateTime = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
