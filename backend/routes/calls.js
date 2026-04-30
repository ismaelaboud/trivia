const express = require('express');
const router = express.Router();
const axios = require('axios');
const { nanoid } = require('nanoid');
const Call = require('../models/Call');
const Channel = require('../models/Channel');
const { auth } = require('../middleware/auth');

// START a call — owner only
router.post('/start', auth, async (req, res) => {
  try {
    const { channelSlug } = req.body;
    
    // Find channel and verify ownership
    const channel = await Channel.findOne({ 
      slug: channelSlug 
    });
    if (!channel) return res.status(404).json({ 
      message: 'Channel not found' 
    });
    if (channel.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Only channel owner can start a call' 
      });
    }
    
    // Check no active call exists
    const existing = await Call.findOne({ 
      channel: channel._id, 
      isActive: true 
    });
    if (existing) return res.status(400).json({ 
      message: 'Call already active',
      roomUrl: existing.roomUrl
    });
    
    // Create Daily.co room
    const roomName = `questly-${channelSlug}-${nanoid(6)}`;
    const response = await axios.post(
      'https://api.daily.co/v1/rooms',
      {
        name: roomName,
        properties: {
          enable_chat: false,  // use Questly chat
          enable_screenshare: true,
          exp: Math.floor(Date.now() / 1000) + 
            (60 * 60 * 4),  // expires in 4 hours
          eject_at_room_exp: true
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const roomUrl = response.data.url;
    
    // Save call to DB
    const call = await Call.create({
      channel: channel._id,
      roomName,
      roomUrl,
      startedBy: req.user.id,
      isActive: true
    });
    
    // Notify channel members via Socket.io
    const io = req.app.get('io');
    io.to(channelSlug).emit('call_started', {
      roomUrl,
      startedBy: req.user.username,
      callId: call._id
    });
    
    // Send push notification to members
    const { notifyChannelMembers } = require(
      '../utils/pushNotification'
    );
    await notifyChannelMembers(channel._id, {
      title: '🎙️ Live Call Started!',
      body: `${req.user.username} started a call in ${channel.name}`,
      url: `/channel/${channelSlug}`,
      icon: '/logo.png'
    });
    
    res.json({ roomUrl, callId: call._id });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// END a call — owner only
router.post('/end', auth, async (req, res) => {
  try {
    const { channelSlug } = req.body;
    const channel = await Channel.findOne({ 
      slug: channelSlug 
    });
    
    const call = await Call.findOne({ 
      channel: channel._id, 
      isActive: true 
    });
    if (!call) return res.status(404).json({ 
      message: 'No active call' 
    });
    
    // Delete Daily.co room
    await axios.delete(
      `https://api.daily.co/v1/rooms/${call.roomName}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}` 
        }
      }
    );
    
    // Mark call as ended
    call.isActive = false;
    call.endedAt = new Date();
    await call.save();
    
    // Notify members call ended
    const io = req.app.get('io');
    io.to(channelSlug).emit('call_ended', {
      callId: call._id
    });
    
    res.json({ message: 'Call ended' });
    
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET active call for a channel
router.get('/active/:channelSlug', async (req, res) => {
  try {
    const channel = await Channel.findOne({ 
      slug: req.params.channelSlug 
    });
    if (!channel) return res.status(404).json({ 
      message: 'Channel not found' 
    });
    
    const call = await Call.findOne({ 
      channel: channel._id, 
      isActive: true 
    }).populate('startedBy', 'username');
    
    if (!call) return res.json({ active: false });
    
    res.json({ 
      active: true, 
      roomUrl: call.roomUrl,
      callId: call._id,
      startedBy: call.startedBy.username,
      startedAt: call.startedAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
