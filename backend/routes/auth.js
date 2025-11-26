const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * Generate a unique 7-digit user ID
 */
const generateUniqueUserId = async () => {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const id = Math.floor(1000000 + Math.random() * 9000000).toString();
    const existing = await User.findOne({ userId: id });

    if (!existing) {
      return id;
    }
    attempts++;
  }

  throw new Error('Failed to generate unique user ID after multiple attempts');
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Username, email and password are required' });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Validate username format
    if (trimmedUsername.includes('@')) {
      return res
        .status(400)
        .json({ message: 'Username must not contain "@" symbol' });
    }

    if (trimmedUsername.length < 3) {
      return res
        .status(400)
        .json({ message: 'Username must be at least 3 characters long' });
    }

    // Validate email format
    if (!trimmedEmail.toLowerCase().endsWith('@gmail.com')) {
      return res
        .status(400)
        .json({ message: 'Email must be a Gmail address (ends with @gmail.com)' });
    }

    // Check if username exists
    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username not available' });
    }

    // Check if email exists
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate unique user ID
    const userId = await generateUniqueUserId();

    // Create new user
    const user = new User({
      username: trimmedUsername,
      email: trimmedEmail,
      password: trimmedPassword,
      userId,
    });

    await user.save();

    res.status(201).json({
      message: 'Registration successful',
      user: {
        username: user.username,
        email: user.email,
        userId: user.userId,
        fullName: user.fullName,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error('Error registering user:', err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res
        .status(400)
        .json({ message: `${field} already exists` });
    }

    res.status(500).json({
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: 'Username/email/user ID and password are required' });
    }

    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    // Find user by username, email, or userId
    const user = await User.findOne({
      $or: [
        { username: trimmedIdentifier },
        { email: trimmedIdentifier.toLowerCase() },
        { userId: trimmedIdentifier },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Password check (note: in production, use bcrypt)
    if (user.password !== trimmedPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      user: {
        username: user.username,
        email: user.email,
        userId: user.userId,
        fullName: user.fullName,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ message: 'Failed to log in' });
  }
});

/**
 * POST /api/auth/update-profile
 * Update user profile
 */
router.post('/update-profile', async (req, res) => {
  try {
    const { userId, username, email, fullName, bio } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const trimmedUsername = (username || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();

    // Validate required fields
    if (!trimmedUsername || !trimmedEmail) {
      return res
        .status(400)
        .json({ message: 'Username and email are required' });
    }

    // Validate username format
    if (trimmedUsername.includes('@')) {
      return res
        .status(400)
        .json({ message: 'Username must not contain "@" symbol' });
    }

    // Validate email
    if (!trimmedEmail.endsWith('@gmail.com')) {
      return res
        .status(400)
        .json({ message: 'Email must be a Gmail address' });
    }

    // Check if new username is available
    if (trimmedUsername !== user.username) {
      const existingUsername = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: user._id },
      });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username not available' });
      }
    }

    // Check if new email is available
    if (trimmedEmail !== user.email) {
      const existingEmail = await User.findOne({
        email: trimmedEmail,
        _id: { $ne: user._id },
      });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user
    user.username = trimmedUsername;
    user.email = trimmedEmail;
    user.fullName = (fullName || '').trim();
    user.bio = (bio || '').trim();

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        username: user.username,
        email: user.email,
        userId: user.userId,
        fullName: user.fullName,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

/**
 * GET /api/auth/suggestions
 * Get user suggestions
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { userId } = req.query;

    const currentUser = await User.findOne({ userId });
    let filter = { userId: { $ne: userId } };

    if (currentUser && Array.isArray(currentUser.following)) {
      filter.userId = { $ne: userId, $nin: currentUser.following };
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username fullName userId');

    res.json(users);
  } catch (err) {
    console.error('Error loading suggestions:', err);
    res.status(500).json({ message: 'Failed to load suggestions' });
  }
});

/**
 * POST /api/auth/follow
 * Follow/unfollow a user
 */
router.post('/follow', async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body || {};

    if (!fromUserId || !toUserId) {
      return res
        .status(400)
        .json({ message: 'fromUserId and toUserId are required' });
    }

    if (fromUserId === toUserId) {
      return res
        .status(400)
        .json({ message: 'You cannot follow yourself' });
    }

    // Fetch both users
    const [fromUser, toUser] = await Promise.all([
      User.findOne({ userId: fromUserId }),
      User.findOne({ userId: toUserId }),
    ]);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize arrays if they don't exist
    if (!Array.isArray(fromUser.following)) {
      fromUser.following = [];
    }
    if (!Array.isArray(toUser.followers)) {
      toUser.followers = [];
    }

    const fromFollowing = new Set(fromUser.following);
    const toFollowers = new Set(toUser.followers);

    const isCurrentlyFollowing = fromFollowing.has(toUserId);

    if (isCurrentlyFollowing) {
      // Unfollow
      fromFollowing.delete(toUserId);
      toFollowers.delete(fromUserId);
    } else {
      // Follow
      fromFollowing.add(toUserId);
      toFollowers.add(fromUserId);
    }

    fromUser.following = Array.from(fromFollowing);
    toUser.followers = Array.from(toFollowers);

    await Promise.all([fromUser.save(), toUser.save()]);

    // Import emitToUser for targeted notifications
    const { emitToUser } = require('../services/socketService');

    // Emit real-time notification ONLY to the user being followed (not broadcast to all)
    emitToUser(toUser.userId, 'user-followed', {
      followedBy: fromUser.userId,
      followedByUsername: fromUser.username,
      followedUser: toUser.userId,
      isFollowing: !isCurrentlyFollowing,
      timestamp: new Date(),
    });

    res.json({
      message: isCurrentlyFollowing ? 'User unfollowed' : 'User followed',
      following: !isCurrentlyFollowing,
      stats: {
        fromUser: {
          userId: fromUser.userId,
          followersCount: fromUser.followers.length,
          followingCount: fromUser.following.length,
        },
        toUser: {
          userId: toUser.userId,
          followersCount: toUser.followers.length,
          followingCount: toUser.following.length,
        },
      },
    });
  } catch (err) {
    console.error('Error updating follow status:', err);
    res.status(500).json({ message: 'Failed to update follow status' });
  }
});

/**
 * GET /api/auth/profile-stats
 * Get user profile statistics
 */
router.get('/profile-stats', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get post count
    const Post = require('../models/Post');
    const postsCount = await Post.countDocuments({ ownerId: userId });

    // Safe array access
    const followerIds = Array.isArray(user.followers) ? user.followers : [];
    const followingIds = Array.isArray(user.following) ? user.following : [];

    // Fetch follower and following user details
    let followers = [];
    let following = [];

    if (followerIds.length > 0) {
      followers = await User.find({ userId: { $in: followerIds } })
        .select('username userId')
        .lean();
    }

    if (followingIds.length > 0) {
      following = await User.find({ userId: { $in: followingIds } })
        .select('username userId')
        .lean();
    }

    res.json({
      message: 'Profile stats retrieved',
      stats: {
        postsCount,
        followersCount: followerIds.length,
        followingCount: followingIds.length,
        followers,
        following,
      },
    });
  } catch (err) {
    console.error('Error loading profile stats:', err);
    res.status(500).json({ message: 'Failed to load profile stats' });
  }
});

/**
 * GET /api/auth/search
 * Search users by username or userId
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchTerm = query.trim();

    // Search by username or userId (case-insensitive)
    const users = await User.find({
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } },
        { userId: searchTerm }
      ]
    })
      .limit(20)
      .select('username fullName userId bio');

    res.json(users);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ message: 'Failed to search users' });
  }
});

module.exports = router;
