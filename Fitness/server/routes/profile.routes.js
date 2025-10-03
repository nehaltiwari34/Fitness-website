const express = require('express');
const auth = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Update user profile and generate AI fitness plan
router.put('/', auth, async (req, res) => {
  try {
    console.log('Profile update request:', req.body);
    
    const { age, gender, height, weight, fitnessLevel, goals, activityLevel } = req.body;
    
    // Validate required fields
    if (!age || !gender || !height || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Age, gender, height, and weight are required'
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile
    user.profile = {
      age: parseInt(age),
      gender: gender,
      height: parseInt(height),
      weight: parseInt(weight),
      fitnessLevel: fitnessLevel || 'beginner',
      goals: goals || 'General fitness',
      activityLevel: activityLevel || 'moderate'
    };

    // Generate AI fitness plan
    try {
      const fitnessPlan = await geminiService.generatePersonalizedFitnessPlan({
        name: user.name,
        ...user.profile
      });

      user.fitnessPlan = {
        ...fitnessPlan,
        lastUpdated: new Date()
      };
    } catch (aiError) {
      console.error('AI plan generation failed, using default:', aiError);
      // Use default plan if AI fails
      user.fitnessPlan = geminiService.getDefaultFitnessPlan(user.profile);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        fitnessPlan: user.fitnessPlan
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile: ' + error.message
    });
  }
});

// Update daily progress
router.post('/progress', auth, async (req, res) => {
  try {
    const { steps, caloriesConsumed, caloriesBurned, waterIntake, workoutsCompleted, weight } = req.body;
    
    const user = await User.findById(req.user.userId);
    
    // Update streak
    user.updateStreak();
    
    // Update daily progress
    user.dailyProgress = {
      date: new Date(),
      steps: steps || user.dailyProgress.steps,
      caloriesConsumed: caloriesConsumed || user.dailyProgress.caloriesConsumed,
      caloriesBurned: caloriesBurned || user.dailyProgress.caloriesBurned,
      waterIntake: waterIntake || user.dailyProgress.waterIntake,
      workoutsCompleted: workoutsCompleted || user.dailyProgress.workoutsCompleted,
      weight: weight || user.dailyProgress.weight
    };

    await user.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress: user.dailyProgress,
      streak: user.streak
    });

  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress'
    });
  }
});

// Get today's workout
router.get('/workout/today', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const today = new Date().toLocaleString('en-us', { weekday: 'long' });
    
    const weeklySchedule = user.fitnessPlan?.weeklySchedule || [];
    const todayWorkout = weeklySchedule.find(day => day.day === today) || 
                        geminiService.getDefaultWorkout();

    res.json({
      success: true,
      workout: todayWorkout
    });

  } catch (error) {
    console.error('Workout fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout'
    });
  }
});

module.exports = router;