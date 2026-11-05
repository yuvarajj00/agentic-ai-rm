const mongoose = require('mongoose');

const ProofUrlSchema = new mongoose.Schema({
  label: { type: String, default: 'GitHub Repo' },
  url: { type: String, required: true }
}, { _id: false });

const DayProgressSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false },
  completedTasks: [{ type: Number }], // indices of completed tasks
  proofUrls: [ProofUrlSchema],
  notes: { type: String, default: '' },
  isFlaggedForRevision: { type: Boolean, default: false },
  completedAt: { type: Date },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const ProjectSubmissionSchema = new mongoose.Schema({
  projectId: { type: String, required: true }, // P1 through P5
  isSubmitted: { type: Boolean, default: false },
  githubUrl: { type: String, default: '' },
  liveDemoUrl: { type: String, default: '' },
  videoDemoUrl: { type: String, default: '' },
  additionalUrls: [ProofUrlSchema],
  notes: { type: String, default: '' },
  isFlaggedForRevision: { type: Boolean, default: false },
  submittedAt: { type: Date },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: 'default_user', unique: true, index: true },
  completedDays: [{ type: Number }],
  days: {
    type: Map,
    of: DayProgressSchema,
    default: {}
  },
  projectSubmissions: {
    type: Map,
    of: ProjectSubmissionSchema,
    default: {}
  },
  lastActiveDay: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);

