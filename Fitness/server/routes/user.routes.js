const express = require('express');
const auth = require('../middleware/auth.middleware');
const User = require('../models/User.model');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
