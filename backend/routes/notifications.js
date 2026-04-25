const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const mongoose = require('mongoose');

// Save subscription when user enables notifications
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, channelId, guestName } = req.body;

    // Validate required fields
    if (!subscription || !channelId) {
      return res.status(400).json({ 
        message: 'Subscription and channelId are required' 
      });
    }

    // Validate channelId format
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ 
        message: 'Invalid channelId format' 
      });
    }

    // Check if subscription already exists for this channel and endpoint
    const existingSub = await PushSubscription.findOne({
      channel: channelId,
      'subscription.endpoint': subscription.endpoint
    });

    if (existingSub) {
      // Update existing subscription
      existingSub.subscription = subscription;
      if (guestName) existingSub.guestName = guestName;
      await existingSub.save();
      return res.json({ message: 'Subscription updated successfully' });
    }

    // Create new subscription
    const pushSubscription = new PushSubscription({
      channel: channelId,
      subscription,
      guestName: guestName || null
    });

    await pushSubscription.save();
    res.json({ message: 'Subscribed successfully' });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove subscription
router.post('/unsubscribe', async (req, res) => {
  try {
    const { channelId } = req.body;

    if (!channelId) {
      return res.status(400).json({ 
        message: 'ChannelId is required' 
      });
    }

    // For now, we'll remove subscription by channel only
    // In a real app with user authentication, you'd also filter by user
    await PushSubscription.deleteMany({ channel: channelId });
    
    res.json({ message: 'Unsubscribed successfully' });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
