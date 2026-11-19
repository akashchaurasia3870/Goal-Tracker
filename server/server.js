require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const initCronJobs = require('./jobs/cron.jobs');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  // Initialize background cron jobs after DB is connected
  initCronJobs();
});

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` TaskFlow Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(` Port: ${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

// Process signal handling
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Process terminated.');
  });
});
