const { MongoClient } = require('mongodb');
const fs = require('fs');
const dns = require('dns');
require('dotenv').config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'agentic_ai_roadmap';
const collName = process.env.MONGODB_COLLECTION || 'roadmap_state';

const tsContent = fs.readFileSync('src/app/data/curriculum.data.ts', 'utf8');

function extractJson(varName) {
  const marker = `export const ${varName}`;
  const idx = tsContent.indexOf(marker);
  if (idx === -1) {
    console.error(`Marker not found: ${marker}`);
    return [];
  }
  const eqIdx = tsContent.indexOf('=', idx);
  const start = tsContent.indexOf('[', eqIdx);
  const nextExportIdx = tsContent.indexOf('export const', start);
  const block = nextExportIdx === -1 ? tsContent.slice(start) : tsContent.slice(start, nextExportIdx);
  const end = block.lastIndexOf('];');
  const jsonStr = block.slice(0, end + 1).trim();
  return JSON.parse(jsonStr);
}

const techStack = extractJson('INITIAL_TECH_STACK');
const milestones = extractJson('INITIAL_MILESTONES');
const dailyTasks = extractJson('INITIAL_DAILY_TASKS');
const stickyNotes = extractJson('INITIAL_STICKY_NOTES');

console.log(`Parsed: ${dailyTasks.length} days, ${milestones.length} milestones, ${techStack.length} tech skills, ${stickyNotes.length} sticky notes.`);

async function seed() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    const db = client.db(dbName);
    const coll = db.collection(collName);

    const doc = {
      _id: 'current_roadmap_state',
      candidate: 'Yamini Karri',
      dailyTasks,
      milestones,
      techStack,
      stickyNotes,
      updatedAt: new Date().toISOString()
    };

    await coll.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
    console.log(`SUCCESS: Initialized and seeded 35-Day Agentic AI curriculum into MongoDB Atlas (${dbName}.${collName})!`);
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await client.close();
  }
}

seed();

