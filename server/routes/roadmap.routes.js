const express = require('express');
const router = express.Router();
const DailyPlan = require('../models/DailyPlan');
const WeeklyPlan = require('../models/WeeklyPlan');
const PhaseProject = require('../models/PhaseProject');

// GET all daily plans (sorted by day)
router.get('/daily', async (req, res) => {
  try {
    const days = await DailyPlan.find().sort({ day: 1 });
    res.json(days);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a specific daily plan
router.get('/daily/:day', async (req, res) => {
  try {
    const dayNum = parseInt(req.params.day, 10);
    const day = await DailyPlan.findOne({ day: dayNum });
    if (!day) return res.status(404).json({ error: `Day ${dayNum} not found` });
    res.json(day);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all weekly plans
router.get('/weekly', async (req, res) => {
  try {
    const weeks = await WeeklyPlan.find().sort({ week: 1 });
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all phase projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await PhaseProject.find().sort({ phase: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a specific project by id (e.g., P1, P2...)
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await PhaseProject.findOne({ id: req.params.id.toUpperCase() });
    if (!project) return res.status(404).json({ error: `Project ${req.params.id} not found` });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

