const mongoose = require('mongoose');
const slugify = require('slugify');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: '',
    validate: {
      validator: function(value) {
        // Allow empty string or single emoji character
        return value === '' || /^[\p{Emoji}\u200D]+$/u.test(value);
      },
      message: 'Avatar must be empty or a single emoji character'
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    totalScore: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  totalQuestions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug from name before saving
channelSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Add member method
channelSchema.methods.addMember = function(userId) {
  if (!this.members.some(member => member.user.toString() === userId.toString())) {
    this.members.push({ user: userId });
  }
};

// Remove member method
channelSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId.toString());
};

module.exports = mongoose.model('Channel', channelSchema);
