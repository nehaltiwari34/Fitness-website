// server/controllers/authController.js - FIXED VERSION
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fitness-secret-key', {
    expiresIn: '30d',
  });
};

// Register User - REAL MONGODB
exports.register = async (req, res) => {
  try {
    console.log('👤 Registration attempt:', req.body);
    
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user with COMPLETE default profile
    const user = new User({
      name,
      email,
      password,
      profile: {
        age: 25,
        gender: 'other', // CRITICAL: Added gender field
        height: 175,
        weight: 70,
        fitnessLevel: 'beginner',
        goals: 'General fitness',
        activityLevel: 'moderate'
      }
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      fitnessPlan: user.fitnessPlan,
      dailyProgress: user.dailyProgress,
      streak: user.streak
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please complete your profile.',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration: ' + error.message
    });
  }
};

// Login User - REAL MONGODB
exports.login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user in REAL MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last active and streak
    await user.updateStreak();

    // Generate token
    const token = generateToken(user._id);

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      fitnessPlan: user.fitnessPlan,
      dailyProgress: user.dailyProgress,
      streak: user.streak
    };

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login: ' + error.message
    });
  }
};

// Demo Login - REAL MONGODB (Creates demo user in database)
exports.demoLogin = async (req, res) => {
  try {
    console.log('🎮 Demo login activated');
    
    // Check if demo user exists
    let demoUser = await User.findOne({ email: 'demo@fittrack.com' });
    
    if (!demoUser) {
      // Create demo user in REAL MongoDB
      demoUser = new User({
        name: 'Demo Fitness User',
        email: 'demo@fittrack.com',
        password: 'demopassword123',
        profile: {
          age: 28,
          gender: 'male',
          height: 180,
          weight: 75,
          fitnessLevel: 'intermediate',
          goals: 'General fitness',
          activityLevel: 'moderate'
        }
      });
      await demoUser.save();
      console.log('✅ Demo user created in database');
    }

    // Update streak
    await demoUser.updateStreak();

    // Generate token
    const token = generateToken(demoUser._id);

    // Return user without password
    const userResponse = {
      id: demoUser._id,
      name: demoUser.name,
      email: demoUser.email,
      profile: demoUser.profile,
      fitnessPlan: demoUser.fitnessPlan,
      dailyProgress: demoUser.dailyProgress,
      streak: demoUser.streak
    };

    res.json({
      success: true,
      message: 'Demo login successful! Explore all features. 🚀',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      success: false,
      message: 'Demo login failed. Please try again.'
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        fitnessPlan: user.fitnessPlan,
        dailyProgress: user.dailyProgress,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// Test endpoint
exports.test = (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
};