const express = require('express');
const { body, validationResult } = require('express-validator');
const Question = require('../models/Question');
const Channel = require('../models/Channel');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Create question (channel owner only)
router.post('/', auth, [
  body('channelSlug').trim().isLength({ min: 1 }).withMessage('Channel slug required'),
  body('questionText').trim().isLength({ min: 1, max: 500 }).withMessage('Question text required (max 500 chars)'),
  body('correctAnswer').trim().isLength({ min: 1, max: 200 }).withMessage('Correct answer required (max 200 chars)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { channelSlug, questionText, correctAnswer } = req.body;

    // Find channel
    const channel = await Channel.findOne({ slug: channelSlug, isActive: true });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is owner
    if (channel.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only channel owner can create questions' });
    }

    // Check if there's already an active question
    const activeQuestion = await Question.findOne({
      channel: channel._id,
      isActive: true
    });

    if (activeQuestion) {
      return res.status(400).json({ message: 'There is already an active question in this channel' });
    }

    // Create question
    const question = new Question({
      channel: channel._id,
      questionText,
      correctAnswer
    });

    await question.save();

    // Update channel question count
    channel.totalQuestions += 1;
    await channel.save();

    await question.populate('channel', 'name slug');

    res.status(201).json(question);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active question for a channel
router.get('/:channelSlug/active', optionalAuth, async (req, res) => {
  try {
    const { channelSlug } = req.params;

    const channel = await Channel.findOne({ slug: channelSlug, isActive: true });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const question = await Question.findOne({
      channel: channel._id,
      isActive: true
    }).populate('submissions.user', 'username avatar');

    if (!question) {
      return res.json({ message: 'No active question' });
    }

    // Don't send correct answer if not revealed
    const questionData = {
      ...question.toObject(),
      correctAnswer: question.isRevealed ? question.correctAnswer : undefined
    };

    res.json(questionData);
  } catch (error) {
    console.error('Get active question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reveal answer and score submissions (channel owner only)
router.patch('/:id/reveal', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('channel');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is channel owner
    if (question.channel.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only channel owner can reveal answers' });
    }

    if (question.isRevealed) {
      return res.status(400).json({ message: 'Answer already revealed' });
    }

    // Reveal answer and score submissions
    await question.revealAnswer();

    // Update member scores
    const channel = await Channel.findById(question.channel._id).populate('members.user');
    
    for (const submission of question.submissions) {
      if (submission.isCorrect && submission.user) {
        const member = channel.members.find(m => 
          m.user._id.toString() === submission.user.toString()
        );
        if (member) {
          member.totalScore += 1;
          member.questionsAnswered += 1;
          member.correctAnswers += 1;
        }
      } else if (submission.user) {
        const member = channel.members.find(m => 
          m.user._id.toString() === submission.user.toString()
        );
        if (member) {
          member.questionsAnswered += 1;
        }
      }
    }

    await channel.save();

    // Update user total scores
    for (const member of channel.members) {
      await User.findByIdAndUpdate(member.user._id, {
        $inc: { totalScore: member.totalScore }
      });
    }

    await question.populate('submissions.user', 'username avatar');

    res.json({
      message: 'Answer revealed and submissions scored',
      question
    });
  } catch (error) {
    console.error('Reveal answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all questions for a channel (for management)
router.get('/channel/:channelSlug', auth, async (req, res) => {
  try {
    const { channelSlug } = req.params;

    const channel = await Channel.findOne({ slug: channelSlug, isActive: true });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is owner
    if (channel.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only channel owner can view all questions' });
    }

    const questions = await Question.find({ channel: channel._id })
      .sort({ createdAt: -1 })
      .populate('submissions.user', 'username avatar');

    res.json({ questions });
  } catch (error) {
    console.error('Get channel questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Activate question (channel owner only)
router.patch('/:id/activate', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('channel');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is channel owner
    if (question.channel.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only channel owner can activate questions' });
    }

    if (question.isActive) {
      return res.status(400).json({ message: 'Question is already active' });
    }

    // Check if there's already an active question
    const activeQuestion = await Question.findOne({
      channel: question.channel._id,
      isActive: true
    });

    if (activeQuestion) {
      return res.status(400).json({ message: 'There is already an active question in this channel' });
    }

    // Activate the question
    question.isActive = true;
    await question.save();

    await question.populate('submissions.user', 'username avatar');

    res.json({
      message: 'Question activated successfully',
      question
    });
  } catch (error) {
    console.error('Activate question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get question history for a channel
router.get('/:channelSlug/history', optionalAuth, async (req, res) => {
  try {
    const { channelSlug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const channel = await Channel.findOne({ slug: channelSlug, isActive: true });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const questions = await Question.find({
      channel: channel._id,
      isRevealed: true
    })
    .sort({ revealedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('submissions.user', 'username avatar');

    const total = await Question.countDocuments({
      channel: channel._id,
      isRevealed: true
    });

    res.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get question history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get question submissions (channel owner only)
router.get('/:id/submissions', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('channel', 'name slug owner')
      .populate('submissions.user', 'username avatar');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is channel owner
    if (question.channel.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only channel owner can view submissions' });
    }

    res.json({
      question: {
        _id: question._id,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        isRevealed: question.isRevealed,
        revealedAt: question.revealedAt,
        totalSubmissions: question.totalSubmissions,
        correctSubmissions: question.correctSubmissions
      },
      submissions: question.submissions.sort((a, b) => b.submittedAt - a.submittedAt)
    });
  } catch (error) {
    console.error('Get question submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question (channel owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('channel');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is channel owner
    if (question.channel.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only channel owner can delete questions' });
    }

    // Only allow deletion if no submissions yet
    if (question.submissions.length > 0) {
      return res.status(400).json({ message: 'Cannot delete question with submissions' });
    }

    await Question.findByIdAndDelete(req.params.id);

    // Update channel question count
    question.channel.totalQuestions -= 1;
    await question.channel.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
