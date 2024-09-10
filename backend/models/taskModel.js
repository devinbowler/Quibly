const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for folders, tasks, and notes
const folderSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'folder' },
  lastAccessed: { type: Date, default: Date.now },
  children: [{ type: Schema.Types.ObjectId, ref: 'Task' }], // References to tasks or notes inside this folder
  user_id: { type: String, required: true },
});

const taskSchema = new Schema({
  status: { type: String, enum: ['inProgress', 'working', 'completed'], default: 'inProgress' },
  title: { type: String, required: true },
  details: { type: String, minlength: 1, maxlength: 150 },
  dueDate: { type: Date, required: true },
  paused: { type: Boolean, default: false },
  pauseStartTime: { type: Date, default: null },
  lastUpdateTime: { type: Date, default: Date.now },
  user_id: { type: String, required: true },
  parentFolder: { type: Schema.Types.ObjectId, ref: 'Folder' }, // Optional, to link the task with its folder
});

const noteSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String },
  lastAccessed: { type: Date, default: Date.now },
  user_id: { type: String, required: true },
  parentFolder: { type: Schema.Types.ObjectId, ref: 'Folder' }, // Optional, to link the note with its folder
});

module.exports = {
  Task: mongoose.model('Task', taskSchema),
  Folder: mongoose.model('Folder', folderSchema),
  Note: mongoose.model('Note', noteSchema),
};
