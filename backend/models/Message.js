const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null  // null for guests
  },
  senderName: {
    type: String,
    required: true  // always store display name
  },
  senderInitial: {
    type: String
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['message', 'system'],
    default: 'message'
    // system = "IbnTuraab joined the chat"
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
