const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'user_signup',
        'user_login',
        'user_logout',
        'post_created',
        'post_deleted',
        'post_liked',
        'post_unliked',
        'comment_added',
        'comment_deleted',
        'user_followed',
        'user_unfollowed',
        'profile_updated',
        'api_error',
        'system_error',
      ],
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    username: String,
    resourceId: String,
    resourceType: {
      type: String,
      enum: ['post', 'user', 'comment', 'system'],
    },
    action: String,
    details: mongoose.Schema.Types.Mixed,
    statusCode: Number,
    errorMessage: String,
    ipAddress: String,
    userAgent: String,
    duration: Number, // in milliseconds
    metadata: mongoose.Schema.Types.Mixed,
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { collection: 'activity_logs' }
);

// TTL index to auto-delete logs older than 30 days
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
