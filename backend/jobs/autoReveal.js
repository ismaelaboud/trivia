const cron = require('node-cron');
const Question = require('../models/Question');
const ChannelMember = require('../models/ChannelMember');

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
