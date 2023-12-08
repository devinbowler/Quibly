const Project = require('../models/projectModel');
const mongoose = require('mongoose');

// Get all projects
const getProjects = async (req, res) => {
    const user_id = req.user._id;
    try {
        const projects = await Project.find({ user_id });
        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Get a single project
const getProject = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid project' });
    }

    const project = await Project.findById(id);

    if (!project) {
        return res.status(404).json({ error: 'No project found' });
    }

    res.status(200).json(project);
};

// Create a new project
const createProject = async (req, res) => {
    const { title, description } = req.body;
    const user_id = req.user._id; // Assuming you have user authentication

    try {
        const project = await Project.create({ title, description, user_id });
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a project
const deleteProject = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid project' });
    }

    const project = await Project.findOneAndDelete({ _id: id, user_id: req.user._id });

    if (!project) {
        return res.status(404).json({ error: 'No project found' });
    }

    res.status(200).json(project);
};

// Update a project
const updateProject = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid project' });
    }

    const project = await Project.findOneAndUpdate({ _id: id, user_id: req.user._id }, req.body, { new: true });

    if (!project) {
        return res.status(404).json({ error: 'No project found' });
    }

    res.status(200).json(project);
};

module.exports = {
    getProjects,
    getProject,
    createProject,
    deleteProject,
    updateProject
};
