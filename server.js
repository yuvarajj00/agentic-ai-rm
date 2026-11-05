const express = require('express');
const cors = require('cors');
const path = require('path');
const dns = require('dns');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Ensure reliable SRV DNS resolution on Windows / all platforms
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS override skipped:', e.message);
}

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required. Please set it in your .env or environment.');
  process.exit(1);
}
const DB_NAME = process.env.MONGODB_DB || 'agentic_ai_roadmap';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || 'roadmap_state';
const STATE_DOC_ID = 'current_roadmap_state';

app.use(cors());
app.use(express.json({ limit: '15mb' }));

let cachedClient = null;
let cachedDb = null;

function resetConnection() {
  try {
    if (cachedClient) cachedClient.close().catch(() => {});
  } catch (e) {}
  cachedClient = null;
  cachedDb = null;
}

async function getDb() {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000
    });

    client.on('close', () => {
      console.warn('MongoDB connection closed. Auto-reconnecting on next request.');
      resetConnection();
    });

    client.on('error', (err) => {
      console.warn('MongoDB client error:', err.message);
      resetConnection();
    });

    await client.connect();
    cachedClient = client;
    cachedDb = client.db(DB_NAME);
    console.log(`Connected to MongoDB Atlas: database "${DB_NAME}"`);
    return cachedDb;
  } catch (err) {
    resetConnection();
    throw err;
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    res.json({
      status: 'connected',
      database: DB_NAME,
      collection: COLLECTION_NAME,
      time: new Date().toISOString()
    });
  } catch (err) {
    resetConnection();
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/progress - Fetch roadmap state from MongoDB Atlas
app.get('/api/progress', async (req, res) => {
  try {
    const db = await getDb();
    const doc = await db.collection(COLLECTION_NAME).findOne({ _id: STATE_DOC_ID });
    if (!doc) {
      return res.json({ success: true, exists: false, data: null });
    }
    res.json({
      success: true,
      exists: true,
      data: {
        dailyTasks: doc.dailyTasks,
        milestones: doc.milestones,
        techStack: doc.techStack,
        updatedAt: doc.updatedAt
      }
    });
  } catch (err) {
    console.error('GET /api/progress error:', err.message);
    resetConnection();
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/progress - Save roadmap state into MongoDB Atlas
app.post('/api/progress', async (req, res) => {
  try {
    const { dailyTasks, milestones, techStack } = req.body;
    if (!dailyTasks || !Array.isArray(dailyTasks)) {
      return res.status(400).json({ success: false, error: 'dailyTasks array is required' });
    }

    const db = await getDb();
    const updatedAt = new Date().toISOString();

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: STATE_DOC_ID },
      {
        $set: {
          dailyTasks,
          milestones: milestones || [],
          techStack: techStack || [],
          updatedAt
        }
      },
      { upsert: true }
    );

    res.json({ success: true, updatedAt });
  } catch (err) {
    console.error('POST /api/progress error:', err.message);
    resetConnection();
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/progress/reset - Reset progress state in MongoDB Atlas
app.post('/api/progress/reset', async (req, res) => {
  try {
    const db = await getDb();
    await db.collection(COLLECTION_NAME).deleteOne({ _id: STATE_DOC_ID });
    res.json({ success: true, message: 'Reset successful' });
  } catch (err) {
    resetConnection();
    res.status(500).json({ success: false, error: err.message });
  }
});

// Catch unhandled API routes with a 404 JSON error instead of sending index.html
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Serve public static assets (curriculum datasets, icons, manifest)
app.use(express.static(path.join(__dirname, 'public')));

// Serve Angular static production files if built
const distPath = path.join(__dirname, 'dist', 'agentic-ai', 'browser');
app.use(express.static(distPath));

// Fallback for Angular SPA client-side routing
app.use((req, res) => {
  const indexFile = path.join(distPath, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.status(404).send('Agentic AI Flight Deck API running. Build Angular with `npm run build` to serve UI.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Agentic AI Flight Deck server listening on http://localhost:${PORT}`);
  console.log(`MongoDB Atlas Target: ${DB_NAME} / ${COLLECTION_NAME}`);
});
