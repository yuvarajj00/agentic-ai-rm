const express = require('express');
const cors = require('cors');
const path = require('path');
// Load .env from server directory first, fallback to root if not found
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config(); // also check current working directory

const connectDB = require('./config/db');
const roadmapRoutes = require('./routes/roadmap.routes');
const progressRoutes = require('./routes/progress.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/plans', roadmapRoutes);
app.use('/api/progress', progressRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: 'MongoDB Atlas',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Agentic AI Roadmap API running at http://localhost:${PORT}`);
});

