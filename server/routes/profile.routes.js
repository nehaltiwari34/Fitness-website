const express = require('express');
const auth = require('../middleware/auth.middleware');
const User = require('../models/User.model');
// FIXED PATH - adjust based on your directory structure
const geminiService = require('../service/geminiService');

const router = express.Router();

// Get user profile - ENHANCED VERSION
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 Fetching user profile for:', req.user.userId);
    
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ensure all required fields exist with proper defaults
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile || {},
      fitnessPlan: user.fitnessPlan || geminiService.getDefaultFitnessPlan(user.profile || {}),
      dailyProgress: user.dailyProgress || {
        date: new Date(),
        steps: 0,
        caloriesConsumed: 0,
        caloriesBurned: 0,
        waterIntake: 0,
        workoutsCompleted: 0,
        weight: user.profile?.weight || 70
      },
      streak: user.streak || 0,
      lastActive: user.lastActive
    };

    console.log('✅ Profile data prepared:', {
      name: userResponse.name,
      hasProfile: !!userResponse.profile.height,
      hasFitnessPlan: !!userResponse.fitnessPlan
    });

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile: ' + error.message
    });
  }
});

// Update user profile and generate AI fitness plan - ENHANCED
router.put('/', auth, async (req, res) => {
  try {
    console.log('🔄 Profile update request:', req.body);
    
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

    // Generate AI fitness plan with better error handling
    try {
      console.log('🤖 Attempting to generate AI fitness plan...');
      const fitnessPlan = await geminiService.generatePersonalizedFitnessPlan({
        name: user.name,
        ...user.profile
      });

      user.fitnessPlan = {
        ...fitnessPlan,
        lastUpdated: new Date()
      };
      console.log('✅ AI fitness plan applied');
    } catch (aiError) {
      console.log('🔄 AI failed, using default fitness plan');
      user.fitnessPlan = {
        ...geminiService.getDefaultFitnessPlan(user.profile),
        lastUpdated: new Date()
      };
    }

    // Initialize daily progress if needed
    if (!user.dailyProgress) {
      user.dailyProgress = {
        date: new Date(),
        steps: 0,
        caloriesConsumed: 0,
        caloriesBurned: 0,
        waterIntake: 0,
        workoutsCompleted: 0,
        weight: user.profile.weight
      };
    }

    await user.save();
    console.log('💾 User profile saved successfully');

    // Return complete user data
    const responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      fitnessPlan: user.fitnessPlan,
      dailyProgress: user.dailyProgress,
      streak: user.streak || 0
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: responseUser
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile: ' + error.message
    });
  }
});

// Update user profile with fitness journey - SPECIFIC FOR PROFILE SETUP
router.put('/journey', auth, async (req, res) => {
  try {
    console.log('🎯 Fitness journey update request:', req.body);
    
    const { age, gender, height, weight, fitnessLevel, goals, activityLevel } = req.body;
    
    // Validate required fields
    if (!age || !gender || !height || !weight || !goals) {
      return res.status(400).json({
        success: false,
        message: 'All fields including fitness goals are required'
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile with journey selection
    user.profile = {
      age: parseInt(age),
      gender: gender,
      height: parseInt(height),
      weight: parseInt(weight),
      fitnessLevel: fitnessLevel || 'beginner',
      goals: goals, // Fitness journey (Weight loss, Muscle gain, General fitness)
      activityLevel: activityLevel || 'moderate'
    };

    // Generate AI fitness plan
    try {
      console.log('🤖 Generating AI fitness plan for journey:', goals);
      const fitnessPlan = await geminiService.generatePersonalizedFitnessPlan({
        name: user.name,
        ...user.profile
      });

      user.fitnessPlan = {
        ...fitnessPlan,
        lastUpdated: new Date()
      };
      console.log('✅ AI fitness plan applied for journey');
    } catch (aiError) {
      console.log('🔄 AI failed, using default fitness plan for journey');
      user.fitnessPlan = {
        ...geminiService.getDefaultFitnessPlan(user.profile),
        lastUpdated: new Date()
      };
    }

    // Initialize daily progress
    user.dailyProgress = generateDailyProgress(user);

    await user.save();
    console.log('💾 User fitness journey saved successfully to MongoDB');

    // Return complete user data
    const responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      fitnessPlan: user.fitnessPlan,
      dailyProgress: user.dailyProgress,
      streak: user.streak || 0
    };

    res.json({
      success: true,
      message: 'Fitness journey setup completed! Your personalized plan is ready.',
      user: responseUser
    });

  } catch (error) {
    console.error('❌ Fitness journey update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up fitness journey: ' + error.message
    });
  }
});
// Update daily progress - SINGLE VERSION (NO DUPLICATE)
router.post('/progress', auth, async (req, res) => {
  try {
    const { steps, caloriesConsumed, caloriesBurned, waterIntake, workoutsCompleted, weight } = req.body;
    
    console.log('📊 Progress update:', req.body);
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ FIXED: Use await for streak update
    await user.updateStreak();
    
    // Initialize dailyProgress if it doesn't exist
    if (!user.dailyProgress) {
      user.dailyProgress = {
        date: new Date(),
        steps: 0,
        caloriesConsumed: 0,
        caloriesBurned: 0,
        waterIntake: 0,
        workoutsCompleted: 0,
        weight: user.profile?.weight || 70
      };
    }

    // Update only provided fields
    if (steps !== undefined) user.dailyProgress.steps = steps;
    if (caloriesConsumed !== undefined) user.dailyProgress.caloriesConsumed = caloriesConsumed;
    if (caloriesBurned !== undefined) user.dailyProgress.caloriesBurned = caloriesBurned;
    if (waterIntake !== undefined) user.dailyProgress.waterIntake = waterIntake;
    if (workoutsCompleted !== undefined) user.dailyProgress.workoutsCompleted = workoutsCompleted;
    if (weight !== undefined) user.dailyProgress.weight = weight;

    // Update date to today
    user.dailyProgress.date = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress: user.dailyProgress,
      streak: user.streak
    });

  } catch (error) {
    console.error('❌ Progress update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress: ' + error.message
    });
  }
});

// Get real-time user stats
router.get('/realtime-stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        // Generate real-time data based on current time and user activity
        const currentHour = new Date().getHours();
        const isActiveTime = currentHour > 7 && currentHour < 22;
        
        const realTimeStats = {
            steps: Math.floor((user.dailyProgress?.steps || 0) + (isActiveTime ? Math.random() * 50 : 0)),
            heartRate: Math.floor(60 + Math.random() * 40), // 60-100 BPM
            caloriesBurned: Math.floor((user.dailyProgress?.caloriesBurned || 0) + (isActiveTime ? Math.random() * 10 : 0)),
            lastUpdate: new Date()
        };

        res.json({
            success: true,
            stats: realTimeStats
        });
    } catch (error) {
        console.error('Real-time stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching real-time stats'
        });
    }
});

// Stream real-time updates (WebSocket simulation)
router.get('/updates', auth, async (req, res) => {
    try {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Send periodic updates
        const interval = setInterval(() => {
            const update = {
                type: 'stats_update',
                data: {
                    steps: Math.floor(Math.random() * 100),
                    timestamp: new Date().toISOString()
                }
            };
            res.write(`data: ${JSON.stringify(update)}\n\n`);
        }, 30000); // Every 30 seconds

        req.on('close', () => {
            clearInterval(interval);
            res.end();
        });
    } catch (error) {
        console.error('Real-time updates error:', error);
        res.status(500).end();
    }
});

// Get today's workout - ENHANCED VERSION
router.get('/workout/today', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const today = new Date().toLocaleString('en-us', { weekday: 'long' });
    
    console.log('📅 Today is:', today);
    console.log('💪 User fitness plan:', user.fitnessPlan ? 'Exists' : 'Missing');
    
    const weeklySchedule = user.fitnessPlan?.weeklySchedule || [];
    
    // Find today's workout in the schedule
    let todayWorkout = weeklySchedule.find(day => 
      day.day && day.day.toLowerCase() === today.toLowerCase()
    );
    
    console.log('🔍 Found workout in schedule:', todayWorkout ? 'Yes' : 'No');
    
    // If no workout found in schedule, generate a default one
    if (!todayWorkout) {
      console.log('🔄 No workout found, generating default...');
      todayWorkout = getDefaultWorkoutForDay(today);
    }
    
    // Transform the workout data to match frontend expectations
    const transformedWorkout = {
      workoutName: todayWorkout.workoutType || todayWorkout.workoutName || 'Full Body Workout',
      duration: todayWorkout.duration || 45,
      estimatedCalories: todayWorkout.caloriesBurned || todayWorkout.estimatedCalories || 280,
      exercises: transformExercises(todayWorkout.exercises || [])
    };
    
    console.log('✅ Sending workout:', transformedWorkout.workoutName);

    res.json({
      success: true,
      workout: transformedWorkout
    });

  } catch (error) {
    console.error('❌ Workout fetch error:', error);
    // Return a fallback workout if there's an error
    const fallbackWorkout = getFallbackWorkout();
    console.log('🔄 Using fallback workout');
    
    res.json({
      success: true,
      workout: fallbackWorkout
    });
  }
});

// Helper function to generate daily progress
function generateDailyProgress(user) {
  const currentHour = new Date().getHours();
  const baseSteps = Math.floor(Math.random() * 2000) + 2000;
  const activityMultiplier = currentHour > 8 && currentHour < 20 ? 1.5 : 0.8;

  return {
    date: new Date(),
    steps: Math.floor(baseSteps * activityMultiplier),
    caloriesConsumed: Math.floor(Math.random() * 300) + 700,
    caloriesBurned: Math.floor(Math.random() * 200) + 300,
    waterIntake: (Math.random() * 0.8 + 0.5).toFixed(1),
    workoutsCompleted: Math.floor(Math.random() * 2),
    weight: user.profile?.weight || 70,
    heartRate: Math.floor(Math.random() * 40) + 60,
    sleepHours: (Math.random() * 2 + 6).toFixed(1)
  };
}

// Helper function to transform exercises
function transformExercises(exercises) {
  if (!exercises || exercises.length === 0) {
    // Return default exercises if none provided
    return [
      { name: "Bodyweight Squats", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Push-ups", sets: 3, reps: "10-12", rest: "45s" },
      { name: "Plank", sets: 3, reps: "30-45s", rest: "30s" },
      { name: "Lunges", sets: 3, reps: "10/side", rest: "45s" }
    ];
  }
  
  // If exercises are just strings, convert to objects
  if (typeof exercises[0] === 'string') {
    return exercises.map((exercise, index) => ({
      name: exercise,
      sets: 3,
      reps: index % 2 === 0 ? "12-15" : "10-12",
      rest: "60s"
    }));
  }
  
  // If exercises are already objects, ensure they have the right structure
  return exercises.map(exercise => ({
    name: exercise.name || exercise,
    sets: exercise.sets || 3,
    reps: exercise.reps || "10-12",
    rest: exercise.rest || "60s"
  }));
}

// Helper function to get default workout for a specific day
function getDefaultWorkoutForDay(day) {
  const workoutTemplates = {
    'Monday': { 
      workoutType: 'Upper Body Strength', 
      duration: 45, 
      caloriesBurned: 320,
      exercises: ['Push-ups', 'Dumbbell Rows', 'Shoulder Press', 'Bicep Curls']
    },
    'Tuesday': { 
      workoutType: 'Cardio & Core', 
      duration: 30, 
      caloriesBurned: 280,
      exercises: ['Jumping Jacks', 'Plank', 'Mountain Climbers', 'Russian Twists']
    },
    'Wednesday': { 
      workoutType: 'Active Recovery', 
      duration: 20, 
      caloriesBurned: 150,
      exercises: ['Yoga Flow', 'Dynamic Stretching', 'Foam Rolling']
    },
    'Thursday': { 
      workoutType: 'Lower Body Strength', 
      duration: 50, 
      caloriesBurned: 350,
      exercises: ['Squats', 'Lunges', 'Glute Bridges', 'Calf Raises']
    },
    'Friday': { 
      workoutType: 'HIIT Circuit', 
      duration: 25, 
      caloriesBurned: 300,
      exercises: ['Burpees', 'High Knees', 'Plank Jacks', 'Butt Kicks']
    },
    'Saturday': { 
      workoutType: 'Cardio Endurance', 
      duration: 40, 
      caloriesBurned: 320,
      exercises: ['Jogging', 'Jump Rope', 'Step Ups']
    },
    'Sunday': { 
      workoutType: 'Rest Day', 
      duration: 0, 
      caloriesBurned: 0,
      exercises: ['Rest and Recovery']
    }
  };
  
  return workoutTemplates[day] || { 
    workoutType: 'Full Body Workout', 
    duration: 35, 
    caloriesBurned: 250,
    exercises: ['Squats', 'Push-ups', 'Plank', 'Lunges']
  };
}

// Fallback workout in case of any errors
function getFallbackWorkout() {
  return {
    workoutName: "Full Body Strength",
    duration: 45,
    estimatedCalories: 280,
    exercises: [
      { name: "Bodyweight Squats", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Push-ups", sets: 3, reps: "10-12", rest: "45s" },
      { name: "Bent-over Rows", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Plank", sets: 3, reps: "30-45s", rest: "30s" }
    ]
  };
}

module.exports = router;