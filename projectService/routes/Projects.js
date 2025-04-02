const express = require('express');
const router = express.Router();
const Project = require('../models/ProjectModel');
const { verifyToken } = require('../middleware/auth');

router.get('/all',  async (req, res) => {
    try {
        const projects = await Project.find({});
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/show/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        const project = await Project.findOne({ id: projectId });

        if (!project) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

router.post('/add',  async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const data = await newProject.save();
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/update/:id',  async (req, res) => {
    try {
        const projectId = req.params.id;
        const updatedData = req.body;
        const data = await Project.findOneAndUpdate({ id: projectId }, updatedData, { new: true });

        if (!data) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        res.json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/delete/:id',  async (req, res) => {
    try {
        const projectId = req.params.id;
        const data = await Project.findOneAndDelete({ id: projectId });

        if (!data) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        res.json({ message: 'Projet supprimé avec succès', data });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/search',  async (req, res) => {
    try {
        const { name, startDate, endDate, status } = req.query;
        let filter = {};

        if (name) filter.name = { $regex: name, $options: 'i' };
        if (startDate) filter.startDate = { $gte: new Date(startDate) };
        if (endDate) filter.endDate = { $lte: new Date(endDate) };
        if (status) filter.status = status;

        const projects = await Project.find(filter);
        res.json(projects);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


module.exports = router;
