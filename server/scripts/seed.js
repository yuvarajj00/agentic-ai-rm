const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback
}

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DailyPlan = require('../models/DailyPlan');
const WeeklyPlan = require('../models/WeeklyPlan');
const PhaseProject = require('../models/PhaseProject');
const UserProgress = require('../models/UserProgress');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI is not set in server/.env');
    process.exit(1);
  }

  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('[Seed] Connected successfully.');

    // 1. Seed Daily Plans
    const dailyPath = path.join(__dirname, '../../data/daily_plan.json');
    if (fs.existsSync(dailyPath)) {
      const dailyData = JSON.parse(fs.readFileSync(dailyPath, 'utf8'));
      if (dailyData.days && Array.isArray(dailyData.days)) {
        console.log(`[Seed] Ingesting ${dailyData.days.length} daily plans...`);
        for (const day of dailyData.days) {
          await DailyPlan.findOneAndUpdate(
            { day: day.day },
            { $set: day },
            { upsert: true, new: true }
          );
        }
        console.log(`[Seed] Ingested ${dailyData.days.length} daily plans.`);
      }
    }

    // 2. Seed Weekly Plans
    const weeklyPath = path.join(__dirname, '../../data/weekly_plan.json');
    if (fs.existsSync(weeklyPath)) {
      const weeklyData = JSON.parse(fs.readFileSync(weeklyPath, 'utf8'));
      if (weeklyData.weeks && Array.isArray(weeklyData.weeks)) {
        console.log(`[Seed] Ingesting ${weeklyData.weeks.length} weekly plans...`);
        for (const week of weeklyData.weeks) {
          await WeeklyPlan.findOneAndUpdate(
            { week: week.week },
            { $set: week },
            { upsert: true, new: true }
          );
        }
        console.log(`[Seed] Ingested ${weeklyData.weeks.length} weekly plans.`);
      }
    }

    // 3. Seed Phase Projects
    const projectsPath = path.join(__dirname, '../../data/phase_projects.json');
    if (fs.existsSync(projectsPath)) {
      const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
      if (projectsData.projects && Array.isArray(projectsData.projects)) {
        console.log(`[Seed] Ingesting ${projectsData.projects.length} phase projects...`);
        for (const proj of projectsData.projects) {
          await PhaseProject.findOneAndUpdate(
            { id: proj.id },
            { $set: proj },
            { upsert: true, new: true }
          );
        }
        console.log(`[Seed] Ingested ${projectsData.projects.length} phase projects.`);
      }
    }

    // 4. Ensure initial UserProgress exists
    let userProgress = await UserProgress.findOne({ userId: 'default_user' });
    if (!userProgress) {
      console.log('[Seed] Initializing default user progress profile...');
      userProgress = new UserProgress({
        userId: 'default_user',
        completedDays: [],
        days: {},
        projectSubmissions: {},
        lastActiveDay: 1
      });
      await userProgress.save();
      console.log('[Seed] Default user progress initialized.');
    }

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
}

seed();
