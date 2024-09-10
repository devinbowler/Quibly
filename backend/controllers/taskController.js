const { Task, Folder, Note } = require('../models/taskModel');
const mongoose = require('mongoose');

// Get all tasks, notes, and folders
const getAllItems = async (req, res) => {
    const user_id = req.user._id;

    try {
        const tasks = await Task.find({ user_id });
        const folders = await Folder.find({ user_id });
        const notes = await Note.find({ user_id });
        
        res.status(200).json({ tasks, folders, notes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a folder
const createFolder = async (req, res) => {
    const { name } = req.body;
    const user_id = req.user._id;

    try {
        const folder = await Folder.create({ name, user_id });
        res.status(201).json(folder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create a task
const createTask = async (req, res) => {
    const { title, details, dueDate, parentFolder } = req.body;
    const user_id = req.user._id;

    try {
        const task = await Task.create({ title, details, dueDate, user_id, parentFolder });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create a note
const createNote = async (req, res) => {
    const { title, body, parentFolder } = req.body;
    const user_id = req.user._id;

    try {
        const note = await Note.create({ title, body, user_id, parentFolder });
        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a folder, task, or note
const deleteItem = async (req, res) => {
    const { id, type } = req.params;  // Type: 'task', 'note', 'folder'

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid ID' });
    }

    try {
        let deletedItem;
        if (type === 'task') {
            deletedItem = await Task.findByIdAndDelete(id);
        } else if (type === 'note') {
            deletedItem = await Note.findByIdAndDelete(id);
        } else if (type === 'folder') {
            deletedItem = await Folder.findByIdAndDelete(id);
        }

        if (!deletedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json(deletedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a task or note
const updateTask = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid ID' });
    }

    try {
        const task = await Task.findByIdAndUpdate(id, req.body, { new: true });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateNote = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid ID' });
    }

    try {
        const note = await Note.findByIdAndUpdate(id, req.body, { new: true });
        if (!note) return res.status(404).json({ error: 'Note not found' });

        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllItems,
    createFolder,
    createTask,
    createNote,
    deleteItem,
    updateTask,
    updateNote,
};
