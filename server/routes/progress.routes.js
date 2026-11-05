const express = require('express');
const router = express.Router();
const UserProgress = require('../models/UserProgress');

// Helper to get or create default user progress
async function getOrCreateProgress(userId = 'default_user') {
  let progress = await UserProgress.findOne({ userId });
  if (!progress) {
    progress = new UserProgress({
      userId,
      completedDays: [],
      days: {},
      projectSubmissions: {},
      lastActiveDay: 1
    });
    await progress.save();
  }
  return progress;
}

// GET user progress
router.get('/', async (req, res) => {
  try {
    const progress = await getOrCreateProgress('default_user');
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update day progress
router.put('/day/:day', async (req, res) => {
  try {
    const dayNum = parseInt(req.params.day, 10);
    const { isCompleted, completedTasks, proofUrls, notes, isFlaggedForRevision } = req.body;
    
    const progress = await getOrCreateProgress('default_user');
    
    const currentDayData = progress.days.get(String(dayNum)) || {
      day: dayNum,
      isCompleted: false,
      completedTasks: [],
      proofUrls: [],
      notes: '',
      isFlaggedForRevision: false
    };

    if (typeof isCompleted === 'boolean') {
      currentDayData.isCompleted = isCompleted;
      if (isCompleted) {
        currentDayData.completedAt = currentDayData.completedAt || new Date();
        if (!progress.completedDays.includes(dayNum)) {
          progress.completedDays.push(dayNum);
          progress.completedDays.sort((a, b) => a - b);
        }
      } else {
        progress.completedDays = progress.completedDays.filter(d => d !== dayNum);
      }
    }

    if (Array.isArray(completedTasks)) {
      currentDayData.completedTasks = completedTasks;
    }

    if (Array.isArray(proofUrls)) {
      currentDayData.proofUrls = proofUrls;
    }

    if (typeof notes === 'string') {
      currentDayData.notes = notes;
    }

    if (typeof isFlaggedForRevision === 'boolean') {
      currentDayData.isFlaggedForRevision = isFlaggedForRevision;
    }

    currentDayData.updatedAt = new Date();
    progress.days.set(String(dayNum), currentDayData);
    progress.lastActiveDay = dayNum;

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update project submission
router.put('/project/:projectId', async (req, res) => {
  try {
    const projId = req.params.projectId.toUpperCase();
    const { isSubmitted, githubUrl, liveDemoUrl, videoDemoUrl, additionalUrls, notes, isFlaggedForRevision } = req.body;

    const progress = await getOrCreateProgress('default_user');

    const currentProjData = progress.projectSubmissions.get(projId) || {
      projectId: projId,
      isSubmitted: false,
      githubUrl: '',
      liveDemoUrl: '',
      videoDemoUrl: '',
      additionalUrls: [],
      notes: '',
      isFlaggedForRevision: false
    };

    if (typeof isSubmitted === 'boolean') {
      currentProjData.isSubmitted = isSubmitted;
      if (isSubmitted && !currentProjData.submittedAt) {
        currentProjData.submittedAt = new Date();
      }
    }

    if (typeof githubUrl === 'string') currentProjData.githubUrl = githubUrl;
    if (typeof liveDemoUrl === 'string') currentProjData.liveDemoUrl = liveDemoUrl;
    if (typeof videoDemoUrl === 'string') currentProjData.videoDemoUrl = videoDemoUrl;
    if (Array.isArray(additionalUrls)) currentProjData.additionalUrls = additionalUrls;
    if (typeof notes === 'string') currentProjData.notes = notes;
    if (typeof isFlaggedForRevision === 'boolean') currentProjData.isFlaggedForRevision = isFlaggedForRevision;

    currentProjData.updatedAt = new Date();
    progress.projectSubmissions.set(projId, currentProjData);

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

