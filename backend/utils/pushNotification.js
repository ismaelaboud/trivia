const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

async function notifyChannelMembers(channelId, payload) {
  try {
    const subs = await PushSubscription.find({ 
      channel: channelId 
    });
    
    if (subs.length === 0) {
      console.log('No subscribers found for channel:', channelId);
      return;
    }

    const notifications = subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          sub.subscription,
          JSON.stringify(payload)
        );
        console.log('Notification sent successfully to:', sub.subscription.endpoint);
      } catch (err) {
        // Subscription expired — remove it
        if (err.statusCode === 410) {
          console.log('Subscription expired, removing:', sub.subscription.endpoint);
          await PushSubscription.findByIdAndDelete(sub._id);
        } else {
          console.error('Error sending notification:', err);
        }
      }
    });
    
    await Promise.allSettled(notifications);
    console.log(`Processed ${subs.length} notifications for channel ${channelId}`);
  } catch (error) {
    console.error('Error in notifyChannelMembers:', error);
  }
}

module.exports = { notifyChannelMembers };
