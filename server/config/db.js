const dns = require('dns');
// Ensure SRV DNS resolution succeeds on Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback if permissions restrict custom dns servers
}

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
