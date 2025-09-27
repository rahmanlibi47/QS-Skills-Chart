const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  group: { type: String, required: true },
  level1: { type: Number, default: 0 },
  level2: { type: Number, default: 0 },
  level3: { type: Number, default: 0 },
}, { timestamps: true });

const EmployeeSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  skills: [SkillSchema],
}, { timestamps: true });

module.exports = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);