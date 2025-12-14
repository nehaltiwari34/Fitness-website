// server/middleware/auth.middleware.js - FIXED VERSION
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware checking token...');
    
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token provided');
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      console.log('❌ Invalid token format');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // Verify token with better error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fitness-secret-key');
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
    
    // Extract userId from decoded token
    const userId = decoded.userId || decoded.id || decoded._id;
    
    if (!userId) {
      console.error('❌ No user ID found in token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token: No user ID found'
      });
    }

    // Create user object
    req.user = {
      userId: userId.toString(),
      email: decoded.email || 'user@fittrack.com',
      ...decoded
    };
    
    console.log('✅ Auth successful for user:', req.user.userId);
    next();
    
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Authentication error: ' + error.message
    });
  }
};

module.exports = auth;