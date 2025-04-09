const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect("mongodb://mongo:27017/authDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const Task = require("../taskService/models/taskmodel");
const Project = require("../projectService/models/ProjectModel");


app.get("/stats", async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "Terminé" });
    const pendingTasks = await Task.countDocuments({ status: "En cours" });

    const taskByUser = await Task.aggregate([
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } }
    ]);

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      taskByUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4000, () => console.log("Service de statistiques sur le port 4000"));
