// server/controllers/communityController.js - COMPLETE DYNAMIC VERSION
const { CommunityPost, Article, Challenge, Comment } = require('../models/Community.model');
const User = require('../models/User.model');

// Get all community posts
exports.getPosts = async (req, res) => {
  try {
    console.log('📰 Fetching community posts for user:', req.user.userId);
    
    const posts = await CommunityPost.find({})
      .populate('userId', 'name profile.picture')
      .populate({
        path: 'comments',
        populate: {
          path: 'userId',
          select: 'name profile.picture'
        }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    // Check if user has liked each post
    const postsWithLikes = posts.map(post => ({
      ...post.toObject(),
      hasLiked: post.likes.includes(req.user.userId)
    }));

    res.json({
      success: true,
      posts: postsWithLikes,
      total: posts.length
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching community posts'
    });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, type, title, tags, image } = req.body;
    
    console.log('📝 Creating new post for user:', req.user.userId);

    const post = new CommunityPost({
      userId: req.user.userId,
      content,
      type: type || 'text',
      title,
      tags,
      image,
      likes: [],
      comments: []
    });

    await post.save();
    await post.populate('userId', 'name profile.picture');

    // Emit real-time update via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.emit('newPost', {
        post: {
          ...post.toObject(),
          hasLiked: false
        }
      });
    }

    res.json({
      success: true,
      message: 'Post created successfully',
      post: post
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post'
    });
  }
};

// Like/unlike a post
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    console.log('❤️ Handling like for post:', postId, 'by user:', req.user.userId);

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const hasLiked = post.likes.includes(req.user.userId);
    let updatedPost;

    if (hasLiked) {
      // Unlike the post
      updatedPost = await CommunityPost.findByIdAndUpdate(
        postId,
        { $pull: { likes: req.user.userId } },
        { new: true }
      );
    } else {
      // Like the post
      updatedPost = await CommunityPost.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: req.user.userId } },
        { new: true }
      );
    }

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.emit('likeUpdate', {
        postId: postId,
        likes: updatedPost.likes.length,
        hasLiked: !hasLiked
      });
    }

    res.json({
      success: true,
      message: hasLiked ? 'Post unliked' : 'Post liked',
      likes: updatedPost.likes.length,
      hasLiked: !hasLiked
    });

  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating like'
    });
  }
};

// Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    
    console.log('💬 Adding comment to post:', postId, 'by user:', req.user.userId);

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = new Comment({
      userId: req.user.userId,
      content,
      postId: postId
    });

    await comment.save();
    await comment.populate('userId', 'name profile.picture');

    // Add comment to post
    post.comments.push(comment._id);
    await post.save();

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.emit('newComment', {
        postId: postId,
        comment: comment
      });
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: comment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
};

// Get all articles
exports.getArticles = async (req, res) => {
  try {
    console.log('📚 Fetching articles for user:', req.user.userId);
    
    const articles = await Article.find({})
      .sort({ publishedAt: -1 })
      .limit(20);

    res.json({
      success: true,
      articles: articles,
      total: articles.length
    });

  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles'
    });
  }
};

// Get all challenges
exports.getChallenges = async (req, res) => {
  try {
    console.log('🏆 Fetching challenges for user:', req.user.userId);
    
    const challenges = await Challenge.find({})
      .populate('participants.userId', 'name profile.picture')
      .sort({ startDate: -1 })
      .limit(10);

    res.json({
      success: true,
      challenges: challenges,
      total: challenges.length
    });

  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching challenges'
    });
  }
};

// Join a challenge
exports.joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    
    console.log('🎯 User joining challenge:', challengeId, 'user:', req.user.userId);

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if user already joined
    const alreadyJoined = challenge.participants.some(
      participant => participant.userId.toString() === req.user.userId
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'Already joined this challenge'
      });
    }

    // Add user to participants
    challenge.participants.push({
      userId: req.user.userId,
      joinedAt: new Date(),
      progress: 0
    });

    await challenge.save();

    // Update user's joined challenges
    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { 'community.joinedChallenges': challengeId }
    });

    res.json({
      success: true,
      message: 'Successfully joined the challenge!',
      challenge: challenge
    });

  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining challenge'
    });
  }
};

// Get user's community activity
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    console.log('📊 Getting community activity for user:', userId);

    const [userPosts, userComments, joinedChallenges] = await Promise.all([
      CommunityPost.find({ userId: userId })
        .populate('userId', 'name profile.picture')
        .sort({ createdAt: -1 })
        .limit(10),
      
      Comment.find({ userId: userId })
        .populate('postId')
        .sort({ createdAt: -1 })
        .limit(10),
      
      Challenge.find({ 'participants.userId': userId })
        .select('title description status participants')
        .sort({ startDate: -1 })
        .limit(5)
    ]);

    const activity = {
      posts: userPosts,
      comments: userComments,
      challenges: joinedChallenges,
      stats: {
        totalPosts: userPosts.length,
        totalComments: userComments.length,
        totalChallenges: joinedChallenges.length,
        totalLikes: userPosts.reduce((sum, post) => sum + post.likes.length, 0)
      }
    };

    res.json({
      success: true,
      activity: activity
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity'
    });
  }
};

// Search community content
exports.searchCommunity = async (req, res) => {
  try {
    const { query, type } = req.query;
    
    console.log('🔍 Searching community content:', query, 'type:', type);

    let results = {};

    if (!type || type === 'posts') {
      const posts = await CommunityPost.find({
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { title: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      })
      .populate('userId', 'name profile.picture')
      .sort({ createdAt: -1 })
      .limit(10);

      results.posts = posts;
    }

    if (!type || type === 'articles') {
      const articles = await Article.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ publishedAt: -1 })
      .limit(10);

      results.articles = articles;
    }

    if (!type || type === 'challenges') {
      const challenges = await Challenge.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ startDate: -1 })
      .limit(10);

      results.challenges = challenges;
    }

    res.json({
      success: true,
      results: results,
      query: query,
      type: type
    });

  } catch (error) {
    console.error('Search community error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching community content'
    });
  }
};

// Get community statistics
exports.getCommunityStats = async (req, res) => {
  try {
    console.log('📈 Getting community statistics');

    const [
      totalPosts,
      totalUsers,
      totalChallenges,
      activeChallenges,
      recentPosts
    ] = await Promise.all([
      CommunityPost.countDocuments(),
      User.countDocuments(),
      Challenge.countDocuments(),
      Challenge.countDocuments({ status: 'active' }),
      CommunityPost.find()
        .populate('userId', 'name profile.picture')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const stats = {
      totalPosts,
      totalUsers,
      totalChallenges,
      activeChallenges,
      recentActivity: recentPosts
    };

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Get community stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching community statistics'
    });
  }
};

module.exports = exports;