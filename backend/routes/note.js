const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  createNote,
  updateNote,
  deleteNote,
  getNotes
} = require('../controllers/noteController');

const router = express.Router();

// Require authentication for all note routes
router.use(requireAuth);

// GET all notes
router.get('/', getNotes);

// POST a new note
router.post('/', createNote);

// PATCH an existing note
router.patch('/:id', updateNote);

// DELETE a note
router.delete('/:id', deleteNote);

module.exports = router;
