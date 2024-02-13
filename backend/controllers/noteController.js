const Note = require('../models/noteModel');

// Create a new note
const createNote = async (req, res) => {
  const { text } = req.body;
  const { userId } = req; // Assuming you have user ID from auth middleware

  try {
    const note = await Note.create({ text, createdBy: userId });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an existing note
const updateNote = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const note = await Note.findOneAndUpdate(
      { _id: id, createdBy: req.userId },
      { text },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ error: 'No such note' });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  const { id } = req.params;

  try {
    const note = await Note.findOneAndDelete({ _id: id, createdBy: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'No such note' });
    }
    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all notes for a user
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ createdBy: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createNote,
  updateNote,
  deleteNote,
  getNotes
};
