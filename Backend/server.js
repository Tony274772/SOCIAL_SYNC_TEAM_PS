require('dotenv').config();

console.log('🔧 Initializing Social Sync Server...');

const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const monitoringRoutes = require('./routes/monitoring');
const { initializeSocket } = require('./services/socketService');
const { requestLoggingMiddleware, errorLoggingMiddleware } = require('./middleware/loggingMiddleware');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

console.log(`⚙️  Configuration: PORT=${PORT}, ENV=${process.env.NODE_ENV}`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Activity logging middleware
app.use(requestLoggingMiddleware);

// Serve static files from frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Fallback to index.html for any non-API route (SPA support)
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error logging middleware
app.use(errorLoggingMiddleware);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    // Initialize Socket.IO
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📝 API Documentation:`);
      console.log(`   - Auth endpoints: /api/auth/*`);
      console.log(`   - Post endpoints: /api/posts/*`);
      console.log(`   - Monitoring endpoints: /api/monitoring/*`);
      console.log(`   - Health check: /api/health`);
      console.log(`📊 Monitoring Features:`);
      console.log(`   - Activity Logs: /api/monitoring/logs`);
      console.log(`   - Statistics: /api/monitoring/stats`);
      console.log(`   - System Health: /api/monitoring/health`);
      console.log(`   - Event Stream: /api/monitoring/events`);
      console.log(`🔌 WebSocket (Socket.IO) enabled for real-time updates`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
