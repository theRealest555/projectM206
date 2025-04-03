const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const ProjectSchema = new Schema({
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['ongoing', 'completed', 'on hold'], default: 'ongoing' },
    category: { type: String, required: true }
});

ProjectSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('Project', ProjectSchema);
