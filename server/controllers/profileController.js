const User = require('../models/User.model');
const Workout = require('../models/Workout.model');
const geminiService = require('../service/geminiService');

// Get user profile with real-time data
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user's streak
    await User.findByIdAndUpdate(req.user.userId, {
      lastActive: new Date()
    });

    // Generate or ensure fitness plan exists
    if (!user.fitnessPlan || !user.fitnessPlan.weeklySchedule) {
      const fitnessPlan = generateFitnessPlan(user.profile);
      await User.findByIdAndUpdate(req.user.userId, {
        fitnessPlan: fitnessPlan
      });
      user.fitnessPlan = fitnessPlan;
    }

    // Ensure daily progress exists for today
    const today = new Date().toDateString();
    const lastProgressDate = user.dailyProgress?.date ? new Date(user.dailyProgress.date).toDateString() : null;
    
    if (!user.dailyProgress || lastProgressDate !== today) {
      const dailyProgress = generateDailyProgress(user);
      await User.findByIdAndUpdate(req.user.userId, {
        dailyProgress: dailyProgress
      });
      user.dailyProgress = dailyProgress;
    }

    console.log('✅ Profile data loaded for:', user.email);
    
    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile data'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { age, gender, height, weight, fitnessLevel, goals, activityLevel } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          'profile.age': age,
          'profile.gender': gender,
          'profile.height': height,
          'profile.weight': weight,
          'profile.fitnessLevel': fitnessLevel,
          'profile.goals': goals,
          'profile.activityLevel': activityLevel
        }
      },
      { new: true }
    ).select('-password');

    // Regenerate fitness plan when profile updates
    const fitnessPlan = generateFitnessPlan(updatedUser.profile);
    await User.findByIdAndUpdate(req.user.userId, {
      fitnessPlan: fitnessPlan
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// Update user profile with fitness journey - SPECIFIC FOR PROFILE SETUP
exports.updateProfileWithJourney = async (req, res) => {
  try {
    const { age, gender, height, weight, fitnessLevel, goals, activityLevel } = req.body;
    
    console.log('🎯 Fitness journey update request:', req.body);
    
    // Validate required fields for fitness journey
    if (!age || !gender || !height || !weight || !goals) {
      return res.status(400).json({
        success: false,
        message: 'Age, gender, height, weight, and fitness goals are required'
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile with fitness journey
    user.profile = {
      age: parseInt(age),
      gender: gender,
      height: parseInt(height),
      weight: parseInt(weight),
      fitnessLevel: fitnessLevel || 'beginner',
      goals: goals, // This is the fitness journey (Weight loss, Muscle gain, etc.)
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
};

// Get today's workout
exports.getTodayWorkout = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const today = new Date().getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[today];

    // Get workout from fitness plan
    const weeklySchedule = user.fitnessPlan?.weeklySchedule || [];
    const todayWorkout = weeklySchedule.find(workout => workout.day === todayName) || 
                        generateFallbackWorkout(todayName);

    // Add exercises
    const workoutWithExercises = {
      ...todayWorkout,
      exercises: getExercisesForWorkout(todayWorkout.workoutType || todayWorkout.name)
    };

    console.log('✅ Today workout loaded:', workoutWithExercises.workoutName);
    
    res.json({
      success: true,
      workout: workoutWithExercises
    });

  } catch (error) {
    console.error('Today workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today workout'
    });
  }
};

// Helper functions
function generateFitnessPlan(profile) {
  const { weight, height, age, gender, activityLevel, fitnessLevel, goals } = profile || {};
  
  // Calculate daily calories
  const calculatedCalories = calculateDailyCalories(profile);
  const calculatedProtein = Math.round((weight || 70) * 1.8);
  const calculatedWater = Math.round((weight || 70) * 35);

  return {
    dailyCalories: calculatedCalories,
    proteinGoal: calculatedProtein,
    carbsGoal: 230,
    fatGoal: 65,
    waterGoal: calculatedWater,
    stepGoal: 10000,
    workoutGoal: 16,
    weeklySchedule: [
      { day: 'Monday', workoutType: 'Upper Body Strength', duration: 45, caloriesBurned: 320 },
      { day: 'Tuesday', workoutType: 'Cardio & Core', duration: 30, caloriesBurned: 280 },
      { day: 'Wednesday', workoutType: 'Active Recovery', duration: 20, caloriesBurned: 150 },
      { day: 'Thursday', workoutType: 'Lower Body Strength', duration: 50, caloriesBurned: 350 },
      { day: 'Friday', workoutType: 'HIIT Circuit', duration: 25, caloriesBurned: 300 },
      { day: 'Saturday', workoutType: 'Cardio Endurance', duration: 40, caloriesBurned: 320 },
      { day: 'Sunday', workoutType: 'Rest Day', duration: 0, caloriesBurned: 0 }
    ],
    recommendations: [
      "Stay consistent with your workout routine",
      "Drink plenty of water throughout the day",
      "Get 7-9 hours of sleep nightly",
      "Focus on protein intake for muscle growth"
    ],
    fitnessTips: [
      "Warm up before each workout",
      "Focus on proper form over heavy weights",
      "Listen to your body and rest when needed",
      "Stay hydrated during workouts"
    ],
    lastUpdated: new Date()
  };
}

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

function calculateDailyCalories(profile) {
  if (!profile) return 2000;
  
  const { weight = 70, height = 170, age = 25, gender = 'male', activityLevel = 'moderate' } = profile;
  
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
}

function generateFallbackWorkout(dayName) {
  const workoutTemplates = {
    'Monday': { workoutType: 'Upper Body Strength', duration: 45, caloriesBurned: 320 },
    'Tuesday': { workoutType: 'Cardio & Core', duration: 30, caloriesBurned: 280 },
    'Wednesday': { workoutType: 'Active Recovery', duration: 20, caloriesBurned: 150 },
    'Thursday': { workoutType: 'Lower Body Strength', duration: 50, caloriesBurned: 350 },
    'Friday': { workoutType: 'HIIT Circuit', duration: 25, caloriesBurned: 300 },
    'Saturday': { workoutType: 'Cardio Endurance', duration: 40, caloriesBurned: 320 },
    'Sunday': { workoutType: 'Rest Day', duration: 0, caloriesBurned: 0 }
  };
  
  return workoutTemplates[dayName] || { workoutType: 'Full Body Workout', duration: 35, caloriesBurned: 250 };
}

function getExercisesForWorkout(workoutType) {
  const exerciseTemplates = {
    'Upper Body Strength': [
      { name: 'Push-ups', sets: 3, reps: '12-15', rest: '60s' },
      { name: 'Dumbbell Rows', sets: 3, reps: '10-12', rest: '60s' },
      { name: 'Shoulder Press', sets: 3, reps: '10-12', rest: '60s' },
      { name: 'Bicep Curls', sets: 3, reps: '12-15', rest: '45s' }
    ],
    'Cardio & Core': [
      { name: 'Jumping Jacks', sets: 4, reps: '30s', rest: '30s' },
      { name: 'Plank', sets: 3, reps: '45s', rest: '30s' },
      { name: 'Mountain Climbers', sets: 3, reps: '20s', rest: '30s' },
      { name: 'Russian Twists', sets: 3, reps: '15/side', rest: '30s' }
    ],
    'Lower Body Strength': [
      { name: 'Bodyweight Squats', sets: 4, reps: '15-20', rest: '60s' },
      { name: 'Lunges', sets: 3, reps: '12/side', rest: '60s' },
      { name: 'Glute Bridges', sets: 3, reps: '15-20', rest: '45s' },
      { name: 'Calf Raises', sets: 3, reps: '20-25', rest: '30s' }
    ],
    'HIIT Circuit': [
      { name: 'Burpees', sets: 4, reps: '30s', rest: '30s' },
      { name: 'High Knees', sets: 4, reps: '30s', rest: '30s' },
      { name: 'Plank Jacks', sets: 4, reps: '30s', rest: '30s' },
      { name: 'Butt Kicks', sets: 4, reps: '30s', rest: '30s' }
    ],
    'Cardio Endurance': [
      { name: 'Jogging in Place', sets: 1, reps: '10 min', rest: 'None' },
      { name: 'Jump Rope', sets: 3, reps: '2 min', rest: '30s' },
      { name: 'Step Ups', sets: 3, reps: '1 min/side', rest: '30s' }
    ],
    'Rest Day': [
      { name: 'Rest and Recovery', sets: 0, reps: 'All day', rest: 'Enjoy!' }
    ]
  };
  
  return exerciseTemplates[workoutType] || exerciseTemplates['Full Body Workout'];
}

module.exports = exports;