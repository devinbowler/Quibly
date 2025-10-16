const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dailyTaskSchema = new Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  color: { type: String, default: '#495BFA' },
  details: { type: String, default: '' },
  completed: { type: String, default: 'false' },
  user_id: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  generationBatch: { type: Date, default: Date.now } // Track which generation batch this belongs to
});

// Update the generationBatch field on save
dailyTaskSchema.pre('save', function(next) {
  if (this.isNew) {
    this.generationBatch = Date.now();
  }
  next();
});

module.exports = mongoose.model('DailyTask', dailyTaskSchema);
