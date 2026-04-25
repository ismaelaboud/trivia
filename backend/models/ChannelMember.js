const mongoose = require('mongoose');

const channelMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  totalScore: {
    type: Number,
    default: 0
  },
  questionsAnswered: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique user-channel combination
channelMemberSchema.index({ user: 1, channel: 1 }, { unique: true });

module.exports = mongoose.model('ChannelMember', channelMemberSchema);
