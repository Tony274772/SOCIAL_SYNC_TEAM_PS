const ActivityLog = require('../models/ActivityLog');
const { publishToRedis } = require('./socketService');

/**
 * Log activity to database and Redis
 */
const logActivity = async (activityData) => {
  try {
    const log = new ActivityLog({
      eventType: activityData.eventType,
      userId: activityData.userId,
      username: activityData.username,
      resourceId: activityData.resourceId,
      resourceType: activityData.resourceType,
      action: activityData.action,
      details: activityData.details,
      statusCode: activityData.statusCode,
      errorMessage: activityData.errorMessage,
      ipAddress: activityData.ipAddress,
      userAgent: activityData.userAgent,
      duration: activityData.duration,
      metadata: activityData.metadata,
      severity: activityData.severity || 'info',
      timestamp: new Date(),
    });

    await log.save();

    // Publish to Redis for real-time monitoring
    await publishToRedis('activity-logs', {
      ...activityData,
      timestamp: new Date(),
    });

    return log;
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

/**
 * Log API request
 */
const logApiRequest = async (req, res, duration) => {
  try {
    const activityData = {
      eventType: 'api_request',
      userId: req.user?.userId || req.body?.userId,
      username: req.user?.username,
      resourceId: req.params.id,
      resourceType: 'api',
      action: `${req.method} ${req.path}`,
      details: {
        method: req.method,
        path: req.path,
        query: req.query,
      },
      statusCode: res.statusCode,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      duration,
      severity: res.statusCode >= 400 ? 'warning' : 'info',
    };

    await logActivity(activityData);
  } catch (err) {
    console.error('Error logging API request:', err);
  }
};

/**
 * Log error
 */
const logError = async (error, req, context = {}) => {
  try {
    const activityData = {
      eventType: 'system_error',
      userId: req?.user?.userId || req?.body?.userId,
      username: req?.user?.username,
      action: context.action || 'unknown_action',
      errorMessage: error.message,
      details: {
        stack: error.stack,
        context,
      },
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('user-agent'),
      severity: 'error',
    };

    await logActivity(activityData);
  } catch (err) {
    console.error('Error logging error:', err);
  }
};

/**
 * Get activity logs with filters
 */
const getActivityLogs = async (filters = {}, limit = 100, skip = 0) => {
  try {
    const query = {};

    if (filters.eventType) query.eventType = filters.eventType;
    if (filters.userId) query.userId = filters.userId;
    if (filters.severity) query.severity = filters.severity;
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await ActivityLog.countDocuments(query);

    return { logs, total };
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    return { logs: [], total: 0 };
  }
};

/**
 * Get activity statistics
 */
const getActivityStats = async (timeRange = '24h') => {
  try {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '1h':
        startDate = new Date(now - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 24 * 60 * 60 * 1000);
    }

    const stats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const errorStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          severity: { $in: ['error', 'critical'] },
        },
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
    ]);

    const userStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          userId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$userId',
          activities: { $sum: 1 },
        },
      },
      {
        $sort: { activities: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    return {
      timeRange,
      period: { start: startDate, end: now },
      eventStats: stats,
      errorStats,
      topUsers: userStats,
      totalEvents: stats.reduce((sum, stat) => sum + stat.count, 0),
      totalErrors: errorStats.reduce((sum, stat) => sum + stat.count, 0),
    };
  } catch (err) {
    console.error('Error getting activity stats:', err);
    return null;
  }
};

module.exports = {
  logActivity,
  logApiRequest,
  logError,
  getActivityLogs,
  getActivityStats,
};
