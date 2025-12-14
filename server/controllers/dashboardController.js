// server/controllers/dashboardController.js - COMPLETE FILE
const User = require('../models/User.model');
const { WorkoutSession } = require('../models/Workout.model');
const { FoodEntry, WaterIntake } = require('../models/Nutrition.model');

exports.getDashboardData = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard data for user:', req.user.userId);
    
    const user = await User.findById(req.user.userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get today's workout
    const currentDate = new Date();
    const todayIndex = currentDate.getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[todayIndex];
    
    const weeklySchedule = user.fitnessPlan?.weeklySchedule || [];
    const todayWorkout = weeklySchedule.find(workout => workout.day === todayName) || 
                        generateFallbackWorkout(todayName);

    // Get recent workouts
    const recentWorkouts = await WorkoutSession.find({
      userId: req.user.userId,
      completed: true
    })
    .sort({ completedAt: -1 })
    .limit(3)
    .lean();

    // Get today's nutrition summary
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFoods = await FoodEntry.find({
      userId: req.user.userId,
      date: { $gte: todayStart, $lt: tomorrow }
    });

    const nutritionSummary = todayFoods.reduce((acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Calculate weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyWorkouts = await WorkoutSession.find({
      userId: req.user.userId,
      completed: true,
      completedAt: { $gte: weekAgo }
    });

    const weeklyStats = {
      workoutsCompleted: weeklyWorkouts.length,
      totalMinutes: weeklyWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      caloriesBurned: weeklyWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      streak: user.streak || 0
    };

    // Ensure user has proper fitness plan structure
    const fitnessPlan = user.fitnessPlan || {
      dailyCalories: 2000,
      proteinGoal: 150,
      carbsGoal: 250,
      fatGoal: 70,
      waterGoal: 2000,
      stepGoal: 10000,
      workoutGoal: 5,
      weeklySchedule: generateDefaultWeeklySchedule()
    };

    // Ensure daily progress exists
    const dailyProgress = user.dailyProgress || {
      date: new Date(),
      steps: Math.floor(Math.random() * 2000) + 3000,
      caloriesConsumed: nutritionSummary.calories,
      caloriesBurned: Math.floor(Math.random() * 200) + 200,
      waterIntake: (Math.random() * 1.5 + 0.5).toFixed(1),
      workoutsCompleted: 0,
      weight: user.profile?.weight || 70,
      heartRate: Math.floor(Math.random() * 40) + 60,
      sleepHours: (Math.random() * 2 + 6).toFixed(1)
    };

    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        streak: user.streak || 1
      },
      profile: user.profile || {},
      fitnessPlan: fitnessPlan,
      dailyProgress: dailyProgress,
      todayWorkout: {
        ...todayWorkout,
        _id: 'today-workout-' + todayName.toLowerCase(),
        exercises: getExercisesForWorkout(todayWorkout.workoutType || todayWorkout.type)
      },
      weeklyStats: weeklyStats,
      recentWorkouts: recentWorkouts
    };

    console.log('✅ Dashboard data loaded successfully for:', user.email);
    
    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data: ' + error.message
    });
  }
};

// Helper function to generate fallback workout
function generateFallbackWorkout(dayName) {
  const workoutTemplates = {
    'Monday': { 
      name: 'Upper Body Strength', 
      workoutType: 'strength',
      duration: 45, 
      calories: 320, 
      type: 'strength',
      difficulty: 'Intermediate'
    },
    'Tuesday': { 
      name: 'Cardio & Core', 
      workoutType: 'cardio',
      duration: 30, 
      calories: 280, 
      type: 'cardio',
      difficulty: 'Beginner'
    },
    'Wednesday': { 
      name: 'Active Recovery', 
      workoutType: 'recovery',
      duration: 20, 
      calories: 150, 
      type: 'recovery',
      difficulty: 'Easy'
    },
    'Thursday': { 
      name: 'Lower Body Strength', 
      workoutType: 'strength',
      duration: 50, 
      calories: 350, 
      type: 'strength',
      difficulty: 'Intermediate'
    },
    'Friday': { 
      name: 'HIIT Circuit', 
      workoutType: 'hiit',
      duration: 25, 
      calories: 300, 
      type: 'hiit',
      difficulty: 'Advanced'
    },
    'Saturday': { 
      name: 'Cardio Endurance', 
      workoutType: 'cardio',
      duration: 40, 
      calories: 320, 
      type: 'cardio',
      difficulty: 'Intermediate'
    },
    'Sunday': { 
      name: 'Rest Day', 
      workoutType: 'rest',
      duration: 0, 
      calories: 0, 
      type: 'rest',
      difficulty: 'Rest'
    }
  };
  
  return workoutTemplates[dayName] || { 
    name: 'Full Body Workout', 
    workoutType: 'strength',
    duration: 35, 
    calories: 250, 
    type: 'strength',
    difficulty: 'Beginner'
  };
}

// Helper function to get exercises for workout type
function getExercisesForWorkout(workoutType) {
  const exerciseTemplates = {
    'strength': [
      { name: 'Push-ups', sets: 3, reps: '12-15', rest: '60s' },
      { name: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: '60s' },
      { name: 'Bent-over Rows', sets: 3, reps: '10-12', rest: '60s' },
      { name: 'Plank', sets: 3, reps: '30-45s', rest: '30s' }
    ],
    'cardio': [
      { name: 'Jumping Jacks', sets: 4, reps: '30s', rest: '30s' },
      { name: 'High Knees', sets: 3, reps: '45s', rest: '30s' },
      { name: 'Mountain Climbers', sets: 3, reps: '30s', rest: '30s' },
      { name: 'Butt Kicks', sets: 3, reps: '45s', rest: '30s' }
    ],
    'hiit': [
      { name: 'Burpees', sets: 4, reps: '30s', rest: '30s' },
      { name: 'Plank Jacks', sets: 4, reps: '30s', rest: '30s' },
      { name: 'High Knees', sets: 4, reps: '30s', rest: '30s' },
      { name: 'Mountain Climbers', sets: 4, reps: '30s', rest: '30s' }
    ],
    'recovery': [
      { name: 'Light Jogging', sets: 1, reps: '10 min', rest: 'None' },
      { name: 'Dynamic Stretching', sets: 1, reps: '5 min', rest: 'None' },
      { name: 'Foam Rolling', sets: 1, reps: '5 min', rest: 'None' }
    ],
    'rest': [
      { name: 'Rest and Recovery', sets: 0, reps: 'All day', rest: 'Enjoy!' }
    ]
  };
  
  return exerciseTemplates[workoutType] || exerciseTemplates['strength'];
}

function generateDefaultWeeklySchedule() {
  return [
    { day: 'Monday', workoutType: 'Upper Body Strength', duration: 45, caloriesBurned: 320 },
    { day: 'Tuesday', workoutType: 'Cardio & Core', duration: 30, caloriesBurned: 280 },
    { day: 'Wednesday', workoutType: 'Active Recovery', duration: 20, caloriesBurned: 150 },
    { day: 'Thursday', workoutType: 'Lower Body Strength', duration: 50, caloriesBurned: 350 },
    { day: 'Friday', workoutType: 'HIIT Circuit', duration: 25, caloriesBurned: 300 },
    { day: 'Saturday', workoutType: 'Cardio Endurance', duration: 40, caloriesBurned: 320 },
    { day: 'Sunday', workoutType: 'Rest Day', duration: 0, caloriesBurned: 0 }
  ];
}

// Health check endpoint
exports.healthCheck = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Dashboard controller is working!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Dashboard controller error: ' + error.message
    });
  }
};