const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');
const Message = require('../models/Message');

// GET last 50 messages for a channel
router.get('/:channelSlug', async (req, res) => {
  try {
    const { channelSlug } = req.params;
    
    // Find channel by slug
    const channel = await Channel.findOne({ slug: channelSlug });
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Get last 50 messages, sorted by createdAt asc
    const messages = await Message.find({ channel: channel._id })
      .sort({ createdAt: 1 })
      .limit(50)
      .select('_id senderName senderInitial text type createdAt');
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
