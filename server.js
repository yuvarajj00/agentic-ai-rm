const express = require('express');
const cors = require('cors');
const path = require('path');
const dns = require('dns');
const { MongoClient } = require('mongodb');

// Load environment variables (.env in server/ or root)
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Ensure reliable SRV DNS resolution on Windows / all platforms
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback if environment restricts custom DNS
}

const app = express();
const PORT = process.env.PORT || 3000;
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

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI environment variable is required. Please configure it in your Vercel Project Settings > Environment Variables or local .env file.'
    );
  }

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
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

// Dedicated API Router
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', async (req, res) => {
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
apiRouter.get('/progress', async (req, res) => {
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
apiRouter.post('/progress', async (req, res) => {
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
apiRouter.post('/progress/reset', async (req, res) => {
  try {
    const db = await getDb();
    await db.collection(COLLECTION_NAME).deleteOne({ _id: STATE_DOC_ID });
    res.json({ success: true, message: 'Reset successful' });
  } catch (err) {
    resetConnection();
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount API router under both /api and root / for Vercel Serverless Function compatibility
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Serve public static assets (curriculum datasets, icons, manifest)
app.use(express.static(path.join(__dirname, 'public')));

// Serve Angular static production files if built
const distPath = path.join(__dirname, 'dist', 'agentic-ai', 'browser');
app.use(express.static(distPath));

// Fallback for Angular SPA client-side routing (local server mode)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  }
  const indexFile = path.join(distPath, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.status(404).send('Agentic AI Flight Deck API running. Build Angular with `npm run build` to serve UI.');
    }
  });
});

// Start local server if run directly (node server.js)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Agentic AI Flight Deck server listening on http://localhost:${PORT}`);
    console.log(`MongoDB Atlas Target: ${DB_NAME} / ${COLLECTION_NAME}`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;
