const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const TaskSchema = new Schema({
    id: { type: Number, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
    deadline: { type: Date, required: true },
    assignedTo: { type: Number, required: true },
    status: { type: String, enum: ['to do', 'in progress', 'done'], default: 'to do' },
    comments: [{ userId: String, comment: String, date: Date }],
    attachments: [{ filename: String, fileUrl: String }],
    reminderSent: { type: Boolean, default: false },
});

TaskSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('Task', TaskSchema);
