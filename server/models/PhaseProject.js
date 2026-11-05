const mongoose = require('mongoose');

const PhaseProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  phase: { type: Number, required: true },
  week: { type: Number, required: true, index: true },
  dates: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  name: { type: String, required: true },
  level: { type: String },
  objective: { type: String, required: true },
  problem_statement: { type: String, required: true },
  recommended_stack: [{ type: String }],
  core_components: [{
    name: { type: String },
    responsibility: { type: String }
  }],
  required_tools: [{
    tool: { type: String },
    constraints: { type: String }
  }],
  milestones: [{
    days: [{ type: Number }],
    result: { type: String }
  }],
  evaluation_rubric: [mongoose.Schema.Types.Mixed],
  architecture_flow: [mongoose.Schema.Types.Mixed]
}, { timestamps: true });

module.exports = mongoose.model('PhaseProject', PhaseProjectSchema);

