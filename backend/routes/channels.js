const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Channel = require('../models/Channel');
const Question = require('../models/Question');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Create channel
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Channel name required (max 50 chars)'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description max 500 chars')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, avatar } = req.body;

    // Check if slug already exists
    const slug = require('slugify')(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });

    const existingChannel = await Channel.findOne({ slug });
    if (existingChannel) {
      return res.status(400).json({ message: 'Channel with this name already exists' });
    }

    // Create channel
    const channel = new Channel({
      name,
      description: description || '',
      avatar: avatar || '',
      owner: req.user.id,
      slug
    });

    await channel.save();

    // Add to user's owned channels
    req.user.channelsOwned.push(channel._id);
    await req.user.save();

    // Add owner as first member
    channel.addMember(req.user.id);
    await channel.save();

    await channel.populate('owner', 'username avatar');

    res.status(201).json(channel);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search channels
router.get('/search', [
  query('q').trim().isLength({ min: 1 }).withMessage('Search query required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const channels = await Channel.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('owner', 'username avatar')
    .populate('members.user', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Channel.countDocuments({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });

    res.json({
      channels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search channels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get channel by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const channel = await Channel.findOne({ slug: req.params.slug, isActive: true })
      .populate('owner', 'username avatar')
      .populate('members.user', 'username avatar');

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Get active question
    const activeQuestion = await Question.findOne({
      channel: channel._id,
      isActive: true
    }).populate('submissions.user', 'username avatar');

    // Get recent questions (last 10)
    const recentQuestions = await Question.find({
      channel: channel._id,
      isRevealed: true
    })
    .sort({ revealedAt: -1 })
    .limit(10)
    .populate('submissions.user', 'username avatar');

    // Calculate leaderboard
    const leaderboard = channel.members
      .map(member => ({
        user: member.user,
        totalScore: member.totalScore,
        questionsAnswered: member.questionsAnswered || 0,
        correctAnswers: member.correctAnswers || 0
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);

    // Check if current user is a member
    let isMember = false;
    if (req.user) {
      isMember = channel.members.some(member => 
        member.user._id.toString() === req.user.id.toString()
      );
    }

    res.json({
      channel,
      activeQuestion,
      recentQuestions,
      leaderboard,
      isMember,
      isOwner: req.user && channel.owner._id.toString() === req.user.id.toString()
    });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join channel
router.post('/:slug/join', auth, async (req, res) => {
  try {
    const channel = await Channel.findOne({ slug: req.params.slug, isActive: true });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if already a member
    const isMember = channel.members.some(member => 
      member.user.toString() === req.user.id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this channel' });
    }

    // Add member
    channel.addMember(req.user.id);
    await channel.save();

    // Add to user's joined channels
    req.user.channelsJoined.push(channel._id);
    await req.user.save();

    await channel.populate('members.user', 'username avatar');

    res.json({ message: 'Successfully joined channel', channel });
  } catch (error) {
    console.error('Join channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave channel
router.post('/:slug/leave', auth, async (req, res) => {
  try {
    const channel = await Channel.findOne({ slug: req.params.slug, isActive: true });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Owner cannot leave their own channel
    if (channel.owner.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Channel owner cannot leave their own channel' });
    }

    // Remove member
    channel.removeMember(req.user.id);
    await channel.save();

    // Remove from user's joined channels
    req.user.channelsJoined = req.user.channelsJoined.filter(
      channelId => channelId.toString() !== channel._id.toString()
    );
    await req.user.save();

    res.json({ message: 'Successfully left channel' });
  } catch (error) {
    console.error('Leave channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's channels
router.get('/my/channels', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('channelsOwned', 'name slug description avatar totalQuestions createdAt')
      .populate('channelsJoined', 'name slug description avatar totalQuestions createdAt owner')
      .populate('channelsJoined.owner', 'username avatar');

    res.json({
      owned: user.channelsOwned,
      joined: user.channelsJoined.filter(channel => 
        channel.owner._id.toString() !== req.user.id.toString()
      )
    });
  } catch (error) {
    console.error('Get user channels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
