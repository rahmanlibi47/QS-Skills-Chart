import mongoose from 'mongoose'

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  group: { type: String, default: '' },
  level1: { type: Number, default: 0 },
  level2: { type: Number, default: 0 },
  level3: { type: Number, default: 0 },
  userId: { type: String }
}, { timestamps: true })

export default mongoose.models.Skill || mongoose.model('Skill', SkillSchema)
