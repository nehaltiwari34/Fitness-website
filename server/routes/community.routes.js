const express = require('express');
const auth = require('../middleware/auth.middleware');
const communityController = require('../controllers/communityController');

const router = express.Router();

// Posts
router.get('/posts', auth, communityController.getPosts);
router.post('/posts', auth, communityController.createPost);
router.post('/posts/:postId/like', auth, communityController.likePost);
router.post('/posts/:postId/comments', auth, communityController.addComment);

// Articles
router.get('/articles', auth, communityController.getArticles);

// Challenges
router.get('/challenges', auth, communityController.getChallenges);
router.post('/challenges/:challengeId/join', auth, communityController.joinChallenge);

// User activity
router.get('/activity/:userId?', auth, communityController.getUserActivity);

// Search
router.get('/search', auth, communityController.searchCommunity);

// Statistics
router.get('/stats', auth, communityController.getCommunityStats);

module.exports = router;