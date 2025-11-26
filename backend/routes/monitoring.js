const express = require('express');
const router = express.Router();
const { getActivityLogs, getActivityStats } = require('../services/activityLogger');

/**
 * GET /api/monitoring/logs
 * Get activity logs with optional filters
 */
router.get('/logs', async (req, res) => {
  try {
    const {
      eventType,
      userId,
      severity,
      startDate,
      endDate,
      limit = 100,
      skip = 0,
    } = req.query;

    const filters = {
      eventType,
      userId,
      severity,
      startDate,
      endDate,
    };

    const { logs, total } = await getActivityLogs(
      filters,
      parseInt(limit),
      parseInt(skip)
    );

    res.json({
      logs,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

/**
 * GET /api/monitoring/stats
 * Get activity statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;

    const stats = await getActivityStats(timeRange);

    if (!stats) {
      return res.status(500).json({ message: 'Failed to get stats' });
    }

    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/monitoring/health
 * Get system health status
 */
router.get('/health', async (req, res) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    res.json({
      status: 'healthy',
      timestamp: new Date(),
      uptime: {
        seconds: Math.floor(uptime),
        formatted: formatUptime(uptime),
      },
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB',
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
    });
  } catch (err) {
    console.error('Error getting health status:', err);
    res.status(500).json({
      status: 'unhealthy',
      message: err.message,
    });
  }
});

/**
 * GET /api/monitoring/events
 * Get real-time event stream (Server-Sent Events)
 */
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial connection message
  res.write('data: {"message": "Connected to event stream"}\n\n');

  // Keep connection alive
  const interval = setInterval(() => {
    res.write('data: {"type": "heartbeat"}\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

/**
 * Utility function to format uptime
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

module.exports = router;
