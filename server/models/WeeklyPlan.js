const mongoose = require('mongoose');

const WeeklyPlanSchema = new mongoose.Schema({
  week: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  day_range: [{ type: Number }],
  goal: { type: String, required: true },
  key_topics: [{ type: String }],
  weekly_project_id: { type: String, required: true },
  weekly_project_name: { type: String, required: true },
  project_scope: { type: String },
  days: [{ type: Number }],
  week_end_evidence: [{ type: String }],
  definition_of_done: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('WeeklyPlan', WeeklyPlanSchema);

