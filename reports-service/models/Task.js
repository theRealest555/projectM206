const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ["À faire", "En cours", "Terminé"], default: "À faire" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  priority: { type: String, enum: ["Urgente", "Normale", "Basse"], default: "Normale" }
});

module.exports = mongoose.model("Task", TaskSchema);
