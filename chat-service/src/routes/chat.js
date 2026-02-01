const express = require('express');
const { Chat } = require('../models/chat');
const { userAuth } = require('../middlewares/auth');

const chatRouter = express.Router();

chatRouter.get('/:targetUserId', userAuth, async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const userId = req.user._id;

        // Find chat between these two users
        const chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        }).populate({
            path: 'messages.senderId',
            select: 'firstName lastName',
        });

        if (!chat) {
            return res.status(200).json({ messages: [] });
        }

        res.status(200).json(chat);
    } catch (err) {
        console.error("CHAT HISTORY ERROR:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = chatRouter;
