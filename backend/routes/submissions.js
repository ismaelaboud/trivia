const express = require('express');
const { body, validationResult } = require('express-validator');
const Question = require('../models/Question');
const Channel = require('../models/Channel');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Submit answer to active question
router.post('/', [
  body('channelSlug').trim().isLength({ min: 1 }).withMessage('Channel slug required'),
  body('answer').trim().isLength({ min: 1, max: 200 }).withMessage('Answer required (max 200 chars)'),
  body('guestName').optional().trim().isLength({ min: 2, max: 30 }).withMessage('Guest name must be 2-30 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { channelSlug, answer, guestName } = req.body;

    // Find channel
    const channel = await Channel.findOne({ slug: channelSlug, isActive: true });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Find active question
    const question = await Question.findOne({
      channel: channel._id,
      isActive: true
    });

    if (!question) {
      return res.status(404).json({ message: 'No active question in this channel' });
    }

    // Handle guest vs authenticated user
    let userId = null;
    let finalGuestName = guestName;

    if (req.user) {
      userId = req.user.id;
      
      // Check if user is a member
      const isMember = channel.members.some(member => 
        member.user.toString() === req.user.id.toString()
      );
      
      if (!isMember) {
        return res.status(403).json({ message: 'Must be a channel member to submit answers' });
      }
    } else {
      // Guest submission requires guest name
      if (!guestName) {
        return res.status(400).json({ message: 'Guest name required for guest submissions' });
      }
    }

    // Add submission
    await question.addSubmission(userId, finalGuestName, answer);

    res.status(201).json({
      message: 'Answer submitted successfully',
      submissionId: question.submissions[question.submissions.length - 1]._id
    });

  } catch (error) {
    console.error('Submit answer error:', error);
    
    if (error.message === 'User has already submitted an answer') {
      return res.status(400).json({ message: 'You have already submitted an answer to this question' });
    }
    if (error.message === 'Guest name already used') {
      return res.status(400).json({ message: 'This guest name has already been used for this question' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's submissions for a question
router.get('/question/:questionId', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId)
      .populate('channel', 'name slug owner')
      .populate('submissions.user', 'username avatar');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is channel member or owner
    const isMember = question.channel.owner.toString() === req.user.id.toString() ||
      question.channel.members.some(member => 
        member.user.toString() === req.user.id.toString()
      );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find user's submission
    const userSubmission = question.submissions.find(sub => 
      sub.user && sub.user._id.toString() === req.user.id.toString()
    );

    res.json({
      hasSubmitted: !!userSubmission,
      submission: userSubmission,
      question: {
        id: question._id,
        questionText: question.questionText,
        isRevealed: question.isRevealed,
        correctAnswer: question.isRevealed ? question.correctAnswer : undefined
      }
    });
  } catch (error) {
    console.error('Get user submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all submissions for a question (channel owner only)
router.get('/question/:questionId/all', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId)
      .populate('channel', 'name slug owner')
      .populate('submissions.user', 'username avatar');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is channel owner
    if (question.channel.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only channel owner can view all submissions' });
    }

    res.json({
      question,
      submissions: question.submissions,
      stats: {
        total: question.submissions.length,
        correct: question.correctSubmissions,
        incorrect: question.submissions.length - question.correctSubmissions
      }
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
