const express = require('express');
const router = express.Router();
const multer = require('multer');
const Task = require('../models/taskmodel');


router.get('/all',  async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/show/:id',  async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findOne({ id: taskId });

        if (!task) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/add',  async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const data = await newTask.save();
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/update/:id',  async (req, res) => {
    try {
        const taskId = req.params.id;
        const updatedData = req.body;
        const data = await Task.findByIdAndUpdate(taskId, updatedData, { new: true });

        if (!data) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        res.json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/delete/:id',  async (req, res) => {
    try {
        const taskId = req.params.id;
        const data = await Task.findByIdAndDelete(taskId);

        if (!data) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        res.json({ message: 'Tâche supprimée avec succès', data });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.put('/assign/:taskId',  async (req, res) => {
    try {
        const { userId } = req.body;
        const taskId = parseInt(req.params.taskId);

        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const task = await Task.findOneAndUpdate({ id: taskId }, { assignedTo: userId }, { new: true });

        if (!task) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }

        res.json({ message: "Tâche assignée avec succès", task });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/assigned/:userId',  async (req, res) => {
    try {
        const userId = parseInt(req.params.userId)
        const tasks = await Task.find({ assignedTo: userId });

        if (!tasks.length) {
            return res.status(404).json({ message: "Aucune tâche assignée à cet utilisateur" });
        }

        res.json(tasks);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/comment/:id',  async (req, res) => {
    try {
        const taskId = req.params.id;
        const { userId, comment } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        task.comments.push({ userId, comment, date: new Date() });
        await task.save();

        res.json({ message: 'Commentaire ajouté avec succès', task });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/update-status/:id',  async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status } = req.body;

        if (!['to do', 'in progress', 'done'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });

        if (!task) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        res.json({ message: 'Statut de la tâche mis à jour', task });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/kanban',  async (req, res) => {
    try {
        const tasks = await Task.find();
        
        const kanban = {
            todo: tasks.filter(task => task.status === 'to do'),
            inProgress: tasks.filter(task => task.status === 'in progress'),
            done: tasks.filter(task => task.status === 'done')
        };

        res.json(kanban);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/upload/:id',  upload.single('file'), async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        task.attachments.push({
            filename: req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            uploadedAt: new Date()
        });

        await task.save();
        res.json({ message: 'Fichier joint ajouté avec succès', task });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/attachments/:id',  async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        res.json({ attachments: task.attachments });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
