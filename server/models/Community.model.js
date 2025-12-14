const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, {
  timestamps: true
});

const communityPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'discussion'],
    default: 'text'
  },
  title: String,
  content: {
    type: String,
    required: true,
    trim: true
  },
  image: String,
  tags: [String],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: String,
  author: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: String,
  readTime: {
    type: Number,
    default: 5
  },
  tags: [String],
  publishedAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in days
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'upcoming', 'completed'],
    default: 'upcoming'
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  requirements: {
    type: Map,
    of: String
  },
  rewards: [String]
}, {
  timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);
const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
const Article = mongoose.model('Article', articleSchema);
const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = {
  Comment,
  CommunityPost,
  Article,
  Challenge
};