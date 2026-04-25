const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.isGuest;
    },
    minlength: 6
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ''
  },
  totalScore: {
    type: Number,
    default: 0
  },
  channelsOwned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  }],
  channelsJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isGuest) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isGuest) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
