const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { emitToUser } = require('../services/socketService');

/**
 * POST /api/messages/send
 * Send a message to another user
 */
router.post('/send', async (req, res) => {
    try {
        const { senderId, receiverId, messageText } = req.body;

        if (!senderId || !receiverId || !messageText) {
            return res.status(400).json({ message: 'Sender ID, receiver ID, and message text are required' });
        }

        if (messageText.trim().length === 0) {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }

        if (messageText.length > 1000) {
            return res.status(400).json({ message: 'Message is too long (max 1000 characters)' });
        }

        // Check if receiver exists
        const [sender, receiver] = await Promise.all([
            User.findOne({ userId: senderId }),
            User.findOne({ userId: receiverId }),
        ]);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create message (allowed for all users, no follower restriction)
        const message = new Message({
            senderId,
            receiverId,
            messageText: messageText.trim(),
        });

        const savedMessage = await message.save();

        // Emit real-time notification to receiver
        try {
            const Notification = require('../models/Notification');
            await Notification.create({
                userId: receiverId,
                type: 'message',
                title: 'New Message',
                message: `${sender.username} sent you a message`,
                fromUserId: senderId,
                fromUsername: sender.username,
                read: false
            });
        } catch (err) {
            console.error('Error creating message notification:', err);
        }

        emitToUser(receiverId, 'new-message', {
            messageId: savedMessage._id,
            senderId,
            senderUsername: sender.username,
            messageText: savedMessage.messageText,
            createdAt: savedMessage.createdAt,
        });

        res.status(201).json({
            message: 'Message sent successfully',
            data: savedMessage,
        });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

/**
 * GET /api/messages/conversation/:userId
 * Get conversation with a specific user
 */
router.get('/conversation/:userId', async (req, res) => {
    try {
        const { currentUserId } = req.query;
        const { userId: otherUserId } = req.params;

        if (!currentUserId) {
            return res.status(400).json({ message: 'Current user ID is required' });
        }

        // Get messages between the two users
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId },
            ],
        })
            .sort({ createdAt: 1 })
            .limit(100)
            .lean();

        // Mark messages from other user as read
        await Message.updateMany(
            { senderId: otherUserId, receiverId: currentUserId, read: false },
            { read: true }
        );

        res.json(messages);
    } catch (err) {
        console.error('Error fetching conversation:', err);
        res.status(500).json({ message: 'Failed to fetch conversation' });
    }
});

/**
 * GET /api/messages/conversations
 * Get list of all conversations for a user
 */
router.get('/conversations', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Get all messages involving this user
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        })
            .sort({ createdAt: -1 })
            .lean();

        // Group by conversation partner
        const conversationsMap = new Map();

        for (const msg of messages) {
            const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;

            if (!conversationsMap.has(partnerId)) {
                const partner = await User.findOne({ userId: partnerId }).select('username userId').lean();

                // Count unread messages from this partner
                const unreadCount = await Message.countDocuments({
                    senderId: partnerId,
                    receiverId: userId,
                    read: false,
                });

                conversationsMap.set(partnerId, {
                    partnerId,
                    partnerUsername: partner?.username || 'Unknown',
                    lastMessage: msg.messageText,
                    lastMessageTime: msg.createdAt,
                    unreadCount,
                });
            }
        }

        const conversations = Array.from(conversationsMap.values());

        res.json(conversations);
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
});

/**
 * GET /api/messages/unread-count
 * Get total unread message count
 */
router.get('/unread-count', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const count = await Message.countDocuments({
            receiverId: userId,
            read: false,
        });

        res.json({ count });
    } catch (err) {
        console.error('Error fetching unread count:', err);
        res.status(500).json({ message: 'Failed to fetch unread count' });
    }
});

module.exports = router;
