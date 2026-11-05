const mongoose = require('mongoose');

const DailyPlanSchema = new mongoose.Schema({
  day: { type: Number, required: true, unique: true, index: true },
  date: { type: String, required: true },
  weekday: { type: String, required: true },
  week: { type: Number, required: true, index: true },
  phase: { type: String, required: true },
  day_type: { type: String, required: true }, // 'learn_build' | 'integration_review'
  title: { type: String, required: true },
  learning_objective: { type: String, required: true },
  concepts: [{ type: String }],
  hands_on_tasks: [{ type: String }],
  deliverable: { type: String },
  acceptance_criteria: [{ type: String }],
  estimated_minutes: { type: Number, default: 120 }
}, { timestamps: true });

module.exports = mongoose.model('DailyPlan', DailyPlanSchema);

