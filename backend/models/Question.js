const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const questionSchema = new mongoose.Schema({
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  shareId: {
    type: String,
    default: () => nanoid(10),
    unique: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  correctAnswer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  isActive: {
    type: Boolean,
    default: true
  },
  revealAt: {
    type: Date,
    default: null
  },
  isRevealed: {
    type: Boolean,
    default: false
  },
  revealedAt: {
    type: Date
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  correctSubmissions: {
    type: Number,
    default: 0
  },
  submissions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    guestName: {
      type: String
    },
    answer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for finding active questions
questionSchema.index({ channel: 1, isActive: 1 });
questionSchema.index({ channel: 1, createdAt: -1 });

// Method to reveal answer and score submissions
questionSchema.methods.revealAnswer = function() {
  this.isRevealed = true;
  this.revealedAt = new Date();
  
  // Score all submissions
  this.submissions.forEach(submission => {
    const normalizedSubmission = submission.answer.toLowerCase().trim();
    const normalizedCorrect = this.correctAnswer.toLowerCase().trim();
    submission.isCorrect = normalizedSubmission === normalizedCorrect;
    if (submission.isCorrect) {
      this.correctSubmissions++;
    }
  });
  
  this.totalSubmissions = this.submissions.length;
  this.isActive = false;
  
  return this.save();
};

// Method to add submission
questionSchema.methods.addSubmission = function(userId, guestName, answer) {
  // Check if user already submitted
  if (userId) {
    const existingSubmission = this.submissions.find(
      sub => sub.user && sub.user.toString() === userId.toString()
    );
    if (existingSubmission) {
      throw new Error('User has already submitted an answer');
    }
  }
  
  // Check if guest name already used
  if (guestName) {
    const existingSubmission = this.submissions.find(
      sub => sub.guestName && sub.guestName.toLowerCase() === guestName.toLowerCase()
    );
    if (existingSubmission) {
      throw new Error('Guest name already used');
    }
  }
  
  this.submissions.push({
    user: userId,
    guestName,
    answer,
    submittedAt: new Date()
  });
  
  this.totalSubmissions = this.submissions.length;
  
  return this.save();
};

module.exports = mongoose.model('Question', questionSchema);
