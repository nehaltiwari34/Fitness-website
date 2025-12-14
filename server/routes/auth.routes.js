// server/routes/auth.routes.js - REAL MONGODB VERSION
const express = require('express');
const {
  register,
  login,
  demoLogin,
  getProfile,
  test
} = require('../controllers/authController');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

// Test authentication endpoint
router.get('/test', test);

// Register User - REAL MONGODB
router.post('/register', register);

// Login User - REAL MONGODB  
router.post('/login', login);

// Demo Login - REAL MONGODB
router.post('/demo-login', demoLogin);

// Get user profile - REAL MONGODB (protected route)
router.get('/profile', auth, getProfile);

// Health check for auth routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are healthy! (Real MongoDB)',
    endpoints: {
      'POST /api/auth/register': 'User registration (Real MongoDB)',
      'POST /api/auth/login': 'User login (Real MongoDB)', 
      'POST /api/auth/demo-login': 'Demo login (Real MongoDB)',
      'GET /api/auth/profile': 'User profile (protected)',
      'GET /api/auth/test': 'Route test'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;