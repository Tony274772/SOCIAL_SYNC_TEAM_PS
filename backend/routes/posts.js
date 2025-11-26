const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { emitToAll, emitToUser, publishToRedis } = require('../services/socketService');
const { logActivity } = require('../services/activityLogger');

/**
 * GET /api/posts
 * Get all posts or filter by owner
 */
router.get('/', async (req, res) => {
  try {
    const { ownerId } = req.query;
    const filter = ownerId ? { ownerId } : {};

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

/**
 * POST /api/posts
 * Create a new post
 */
router.post('/', async (req, res) => {
  try {
    const { caption, mediaUrl, mediaType, ownerId, ownerUsername } = req.body;

    // Validation
    if (!caption || caption.trim() === '') {
      return res.status(400).json({ message: 'Caption is required' });
    }

    if (!ownerId) {
      return res.status(400).json({ message: 'Owner ID is required' });
    }

    // Verify owner exists
    const owner = await User.findOne({ userId: ownerId });
    if (!owner) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = new Post({
      caption: caption.trim(),
      mediaUrl: mediaUrl && mediaUrl.trim() ? mediaUrl.trim() : undefined,
      mediaType: mediaType || 'text',
      ownerId,
      ownerUsername: ownerUsername || owner.username || 'Unknown',
    });

    const saved = await post.save();
    
    // Log activity
    await logActivity({
      eventType: 'post_created',
      userId: ownerId,
      username: ownerUsername,
      resourceId: saved._id.toString(),
      resourceType: 'post',
      action: 'created_post',
      details: {
        caption: saved.caption,
        mediaType: saved.mediaType,
      },
      severity: 'info',
    });
    
    // Emit real-time notification
    // Emit real-time notification to followers
    try {
      const owner = await User.findOne({ userId: ownerId });
      if (owner && owner.followers && Array.isArray(owner.followers)) {
        owner.followers.forEach(followerId => {
          emitToUser(followerId, 'new-post', {
            postId: saved._id,
            caption: saved.caption,
            createdBy: saved.ownerId,
            createdByUsername: saved.ownerUsername,
            mediaType: saved.mediaType,
            timestamp: new Date(),
          });
        });
      }
    } catch (notifyErr) {
      console.error('Error sending new post notifications:', notifyErr);
    }

    res.status(201).json({
      message: 'Post created successfully',
      post: saved,
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

/**
 * POST /api/posts/:id/like
 * Like/unlike a post
 */
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Initialize likedBy if missing
    if (!Array.isArray(post.likedBy)) {
      post.likedBy = [];
    }

    const index = post.likedBy.indexOf(userId);
    let liked;

    if (index === -1) {
      // User hasn't liked this post
      post.likedBy.push(userId);
      liked = true;
    } else {
      // User already liked it, remove the like
      post.likedBy.splice(index, 1);
      liked = false;
    }

    // Update likes count
    post.likes = post.likedBy.length;
    await post.save();

    // Log activity
    await logActivity({
      eventType: liked ? 'post_liked' : 'post_unliked',
      userId,
      resourceId: post._id.toString(),
      resourceType: 'post',
      action: liked ? 'liked_post' : 'unliked_post',
      details: {
        postId: post._id,
        totalLikes: post.likes,
      },
      severity: 'info',
    });

    // Emit real-time notification
    // Emit real-time notification to post owner
    if (post.ownerId !== userId) {
      emitToUser(post.ownerId, 'post-liked', {
        postId: post._id,
        likedBy: userId,
        totalLikes: post.likes,
        liked,
        timestamp: new Date(),
      });
    }

    res.json({
      message: liked ? 'Post liked' : 'Post unliked',
      postId: post._id,
      likes: post.likes,
      liked,
    });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
});

/**
 * POST /api/posts/:id/comments
 * Add a comment to a post
 */
router.post('/:id/comments', async (req, res) => {
  try {
    const { text, author } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Initialize comments if missing
    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }

    const commentAuthor = author && author.trim() ? author.trim() : 'anonymous';

    const comment = {
      text: text.trim(),
      author: commentAuthor,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    const createdComment = post.comments[post.comments.length - 1];

    // Log activity
    await logActivity({
      eventType: 'comment_added',
      username: author,
      resourceId: post._id.toString(),
      resourceType: 'comment',
      action: 'added_comment',
      details: {
        postId: post._id,
        commentText: text,
        totalComments: post.comments.length,
      },
      severity: 'info',
    });

    // Emit real-time notification
    // Emit real-time notification to post owner
    if (post.ownerId !== author) { // Assuming author is userId or username, logic might need adjustment if author is username but ownerId is userId. 
      // Checking auth.js, author seems to be username in some contexts but let's check how it's passed.
      // In posts.js:176 const { text, author } = req.body;
      // In posts.js:192 const commentAuthor = author ...
      // If author is username, we can't easily compare with ownerId (userId).
      // However, the requirement is "if any coment ... notification should be recieved by right user".
      // The right user is the post owner.
      
      emitToUser(post.ownerId, 'comment-added', {
        postId: post._id,
        commentedBy: author,
        commentText: text,
        totalComments: post.comments.length,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      message: 'Comment added successfully',
      postId: post._id,
      comment: createdComment,
      commentsCount: post.comments.length,
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

/**
 * DELETE /api/posts/:id
 * Delete a post (only owner can delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only owner can delete
    if (post.ownerId !== userId) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity({
      eventType: 'post_deleted',
      userId,
      resourceId: req.params.id,
      resourceType: 'post',
      action: 'deleted_post',
      details: {
        postId: req.params.id,
      },
      severity: 'info',
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

/**
 * GET /api/posts/seed
 * Seed database with sample posts (for demo)
 */
router.post('/seed', async (req, res) => {
  try {
    const samplePosts = [
      {
        caption: 'Beautiful sunset at the beach! 🌅',
        mediaUrl: 'https://via.placeholder.com/400x400?text=Sunset',
        mediaType: 'image',
        ownerId: 'demo_1',
        ownerUsername: 'demo_user',
      },
      {
        caption: 'Morning coffee vibes ☕',
        mediaUrl: 'https://via.placeholder.com/400x400?text=Coffee',
        mediaType: 'image',
        ownerId: 'demo_2',
        ownerUsername: 'coffee_lover',
      },
      {
        caption: 'Just a random thought for today',
        mediaType: 'text',
        ownerId: 'demo_3',
        ownerUsername: 'thoughtful_soul',
      },
    ];

    await Post.deleteMany({});
    const created = await Post.insertMany(samplePosts);

    res.json({
      message: 'Sample posts seeded successfully',
      count: created.length,
    });
  } catch (err) {
    console.error('Error seeding posts:', err);
    res.status(500).json({ message: 'Failed to seed posts' });
  }
});

module.exports = router;
