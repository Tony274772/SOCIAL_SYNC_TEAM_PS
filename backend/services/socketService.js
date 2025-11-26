const redis = require('redis');
const { Server } = require('socket.io');

let io;
let redisClient;
let redisSubscriber;
const activeUsers = new Map(); // userId -> socket connection info

/**
 * Initialize Socket.IO and Redis connection
 */
const initializeSocket = (server) => {
  // Socket.IO setup
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Redis setup
  redisClient = redis.createClient({
    socket: {
      host: '127.0.0.1',
      port: 6379,
    },
  });

  redisSubscriber = redis.createClient({
    socket: {
      host: '127.0.0.1',
      port: 6379,
    },
  });

  // Connect Redis
  redisClient.connect().catch((err) => {
    console.error('❌ Redis connection error:', err.message);
  });

  redisSubscriber.connect().catch((err) => {
    console.error('❌ Redis subscriber connection error:', err.message);
  });

  // Subscribe to Redis channels
  subscribeToRedisChannels();

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    // User joins
    socket.on('user-online', (userId) => {
      activeUsers.set(userId, {
        socketId: socket.id,
        joinedAt: new Date(),
      });
      console.log(`✅ User ${userId} came online`);

      // Broadcast user online status
      io.emit('user-status', {
        userId,
        status: 'online',
        timestamp: new Date(),
      });
    });

    // Listen for real-time post likes
    socket.on('post-liked', (data) => {
      // Broadcast to all connected users
      io.emit('post-liked-notification', {
        postId: data.postId,
        likedBy: data.likedBy,
        likedByUsername: data.likedByUsername,
        totalLikes: data.totalLikes,
        timestamp: new Date(),
      });

      // Publish to Redis for persistence
      publishToRedis('post-events', {
        type: 'liked',
        postId: data.postId,
        likedBy: data.likedBy,
        likedByUsername: data.likedByUsername,
        totalLikes: data.totalLikes,
        timestamp: new Date(),
      });
    });

    // Listen for real-time comments
    socket.on('comment-added', (data) => {
      // Broadcast to all connected users
      io.emit('comment-added-notification', {
        postId: data.postId,
        commentedBy: data.commentedBy,
        commentedByUsername: data.commentedByUsername,
        commentText: data.commentText,
        totalComments: data.totalComments,
        timestamp: new Date(),
      });

      // Publish to Redis
      publishToRedis('post-events', {
        type: 'commented',
        postId: data.postId,
        commentedBy: data.commentedBy,
        commentedByUsername: data.commentedByUsername,
        commentText: data.commentText,
        totalComments: data.totalComments,
        timestamp: new Date(),
      });
    });

    // Listen for new posts
    socket.on('post-created', (data) => {
      // Broadcast to all followers
      io.emit('new-post-notification', {
        postId: data.postId,
        caption: data.caption,
        createdBy: data.createdBy,
        createdByUsername: data.createdByUsername,
        mediaType: data.mediaType,
        timestamp: new Date(),
      });

      // Publish to Redis
      publishToRedis('post-events', {
        type: 'created',
        postId: data.postId,
        caption: data.caption,
        createdBy: data.createdBy,
        createdByUsername: data.createdByUsername,
        mediaType: data.mediaType,
        timestamp: new Date(),
      });
    });

    // Listen for follow events
    socket.on('user-followed', (data) => {
      // Broadcast follow notification
      io.emit('follow-notification', {
        followedBy: data.followedBy,
        followedByUsername: data.followedByUsername,
        followedUser: data.followedUser,
        timestamp: new Date(),
      });

      // Publish to Redis
      publishToRedis('user-events', {
        type: 'followed',
        followedBy: data.followedBy,
        followedByUsername: data.followedByUsername,
        followedUser: data.followedUser,
        timestamp: new Date(),
      });
    });

    // User disconnect
    socket.on('disconnect', () => {
      const userEntry = Array.from(activeUsers.entries()).find(
        ([_, info]) => info.socketId === socket.id
      );
      if (userEntry) {
        const [userId] = userEntry;
        activeUsers.delete(userId);
        console.log(`🔴 User ${userId} went offline`);

        io.emit('user-status', {
          userId,
          status: 'offline',
          timestamp: new Date(),
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};

/**
 * Subscribe to Redis channels for distributed events
 */
const subscribeToRedisChannels = async () => {
  try {
    // Subscribe to post events
    await redisSubscriber.subscribe('post-events', (message) => {
      try {
        const data = JSON.parse(message);
        io.emit('redis-post-event', data);
      } catch (err) {
        console.error('Error parsing post event:', err);
      }
    });

    // Subscribe to user events
    await redisSubscriber.subscribe('user-events', (message) => {
      try {
        const data = JSON.parse(message);
        io.emit('redis-user-event', data);
      } catch (err) {
        console.error('Error parsing user event:', err);
      }
    });

    console.log('✅ Subscribed to Redis channels: post-events, user-events');
  } catch (err) {
    console.error('Error subscribing to Redis channels:', err);
  }
};

/**
 * Publish event to Redis channel
 */
const publishToRedis = async (channel, data) => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.publish(channel, JSON.stringify(data));
    }
  } catch (err) {
    console.error(`Error publishing to Redis channel ${channel}:`, err);
  }
};

/**
 * Emit notification to specific user
 */
const emitToUser = (userId, event, data) => {
  const userInfo = activeUsers.get(userId);
  if (userInfo && io) {
    io.to(userInfo.socketId).emit(event, data);
  }
};

/**
 * Emit notification to all users
 */
const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

/**
 * Get active users count
 */
const getActiveUsersCount = () => {
  return activeUsers.size;
};

/**
 * Check if user is online
 */
const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

/**
 * Get all active users
 */
const getActiveUsers = () => {
  return Array.from(activeUsers.keys());
};

/**
 * Close all connections
 */
const closeConnections = async () => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.disconnect();
    }
    if (redisSubscriber && redisSubscriber.isOpen) {
      await redisSubscriber.disconnect();
    }
    if (io) {
      io.close();
    }
    console.log('✅ All connections closed');
  } catch (err) {
    console.error('Error closing connections:', err);
  }
};

module.exports = {
  initializeSocket,
  emitToUser,
  emitToAll,
  publishToRedis,
  getActiveUsersCount,
  isUserOnline,
  getActiveUsers,
  closeConnections,
};
