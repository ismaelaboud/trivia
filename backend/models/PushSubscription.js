const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null  // null for guest subscribers
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  subscription: {
    type: Object,  // stores endpoint + keys
    required: true
  },
  guestName: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('PushSubscription', schema);
