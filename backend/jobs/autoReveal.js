const cron = require('node-cron');
const Question = require('../models/Question');
const ChannelMember = require('../models/ChannelMember');
const { notifyChannelMembers } = require('../utils/pushNotification');

// Get io instance from app (will be set when server.js runs)
let io = null;
exports.setIO = (ioInstance) => {
  io = ioInstance;
};

// Runs every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    
    // Find all unrevealed questions whose revealAt has passed
    const questions = await Question.find({
      isRevealed: false,
      revealAt: { $lte: now }
    }).populate('channel');

    console.log(`Found ${questions.length} questions to reveal at ${now.toISOString()}`);

    for (const question of questions) {
      // Use the existing revealAnswer method
      await question.revealAnswer();

      // Send push notification to channel members
      await notifyChannelMembers(question.channel._id, {
        title: '✅ Answer Revealed!',
        body: `The answer is: ${question.correctAnswer}`,
        url: `/q/${question.shareId}`,
        icon: '/logo.png'
      });

      // Send system message to chat
      if (io) {
        io.to(question.channel.slug).emit('system_message', {
          text: `✅ Answer revealed: ${question.correctAnswer}`,
          timestamp: new Date()
        });
      }

      // Update member scores for all submissions
      for (const submission of question.submissions) {
        if (submission.user) {
          await ChannelMember.findOneAndUpdate(
            { user: submission.user, channel: question.channel._id },
            { $inc: { totalScore: submission.isCorrect ? 1 : 0 } }
          );
        }
      }

      console.log(`Revealed answer for question: ${question._id}`);
    }
  } catch (error) {
    console.error('Error in auto reveal cron job:', error);
  }
});

console.log('Auto reveal cron job scheduled to run every minute');
