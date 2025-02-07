const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for folders, tasks, and notes
const folderSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'folder' },
  parentFolder: { type: String, required: true },  // <-- New field
  lastAccessed: { type: Date, default: Date.now },
  children: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  user_id: { type: String, required: true },
});

const taskSchema = new Schema({
  title: { type: String, required: true },
  details: { type: String, required: true },  // Ensure this is required
  dueDate: { type: Date, required: true },    // Ensure this is required
  parentFolder: { type: String, required: true },  // Ensure this is passed correctly
  user_id: { type: String, required: true },  // Ensure the user is authenticated
  lastUpdateTime: { type: Date, default: Date.now },
});

const noteSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String },
  lastAccessed: { type: Date, default: Date.now },
  user_id: { type: String, required: true },
  parentFolder: { type: String, required: true }, // Changed to String
});


module.exports = {
  Task: mongoose.model('Task', taskSchema),
  Folder: mongoose.model('Folder', folderSchema),
  Note: mongoose.model('Note', noteSchema),
};
