// server/controllers/progressController.js - COMPLETE DYNAMIC VERSION
const Progress = require('../models/Progress.model');
const User = require('../models/User.model');
const { WorkoutSession } = require('../models/Workout.model');
const { FoodEntry } = require('../models/Nutrition.model');

// Get user progress data
exports.getProgress = async (req, res) => {
  try {
    console.log('📈 Fetching progress data for user:', req.user.userId);
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get weight history
    const weightHistory = await Progress.find({
      userId: req.user.userId,
      weight: { $exists: true }
    })
    .sort({ date: 1 })
    .select('date weight')
    .limit(30);

    // Get recent workouts for progress calculation
    const recentWorkouts = await WorkoutSession.find({
      userId: req.user.userId,
      completed: true
    })
    .sort({ completedAt: -1 })
    .limit(10);

    // Calculate progress metrics
    const progressMetrics = await calculateProgressMetrics(req.user.userId, weightHistory, recentWorkouts);

    res.json({
      success: true,
      progress: progressMetrics,
      weightHistory: weightHistory,
      user: {
        name: user.name,
        profile: user.profile,
        streak: user.streak
      }
    });

  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress data'
    });
  }
};

// Get body measurements
exports.getMeasurements = async (req, res) => {
  try {
    const latestProgress = await Progress.findOne({
      userId: req.user.userId
    })
    .sort({ date: -1 });

    const measurements = latestProgress?.bodyMeasurements || {};

    res.json({
      success: true,
      measurements: measurements
    });

  } catch (error) {
    console.error('Measurements fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching measurements'
    });
  }
};

// Update body measurements
exports.updateMeasurements = async (req, res) => {
  try {
    const { chest, waist, arms, hips, thighs } = req.body;
    
    console.log('📏 Updating measurements for user:', req.user.userId);

    let progress = await Progress.findOne({
      userId: req.user.userId,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user.userId,
        date: new Date()
      });
    }

    progress.bodyMeasurements = {
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      arms: arms ? parseFloat(arms) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      thighs: thighs ? parseFloat(thighs) : undefined
    };

    await progress.save();

    res.json({
      success: true,
      message: 'Measurements updated successfully',
      measurements: progress.bodyMeasurements
    });

  } catch (error) {
    console.error('Update measurements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating measurements'
    });
  }
};

// Log weight
exports.logWeight = async (req, res) => {
  try {
    const { weight } = req.body;
    
    console.log('⚖️ Logging weight for user:', req.user.userId, weight);

    if (!weight || isNaN(weight)) {
      return res.status(400).json({
        success: false,
        message: 'Valid weight is required'
      });
    }

    // Check if weight already logged today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let progress = await Progress.findOne({
      userId: req.user.userId,
      date: { $gte: todayStart, $lt: tomorrow }
    });

    if (progress) {
      progress.weight = parseFloat(weight);
    } else {
      progress = new Progress({
        userId: req.user.userId,
        date: new Date(),
        weight: parseFloat(weight)
      });
    }

    await progress.save();

    // Update user profile with latest weight
    await User.findByIdAndUpdate(req.user.userId, {
      $set: {
        'profile.weight': parseFloat(weight),
        'dailyProgress.weight': parseFloat(weight)
      }
    });

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user-${req.user.userId}`).emit('weightUpdated', {
        weight: parseFloat(weight),
        date: progress.date
      });
    }

    res.json({
      success: true,
      message: `Weight logged: ${weight}kg`,
      progress: progress
    });

  } catch (error) {
    console.error('Log weight error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging weight'
    });
  }
};

// Get progress analytics
exports.getProgressAnalytics = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    console.log('📊 Getting progress analytics for user:', req.user.userId, timeframe);

    const analytics = await calculateProgressAnalytics(req.user.userId, timeframe);

    res.json({
      success: true,
      analytics: analytics,
      timeframe: timeframe
    });

  } catch (error) {
    console.error('Progress analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress analytics'
    });
  }
};

// ========== HELPER FUNCTIONS ==========

// Calculate progress metrics
async function calculateProgressMetrics(userId, weightHistory, recentWorkouts) {
  const user = await User.findById(userId);
  const profile = user.profile || {};
  
  // Calculate BMI
  let bmi = null;
  if (profile.weight && profile.height) {
    bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
  }

  // Calculate weight trend
  let weightTrend = 0;
  if (weightHistory.length >= 2) {
    const firstWeight = weightHistory[0].weight;
    const latestWeight = weightHistory[weightHistory.length - 1].weight;
    weightTrend = latestWeight - firstWeight;
  }

  // Calculate workout statistics
  const workoutStats = recentWorkouts.reduce((stats, workout) => {
    stats.totalWorkouts++;
    stats.totalMinutes += workout.duration || 0;
    stats.totalCalories += workout.caloriesBurned || 0;
    stats.avgDuration = stats.totalMinutes / stats.totalWorkouts;
    return stats;
  }, {
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    avgDuration: 0
  });

  // Get nutrition data for today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayNutrition = await FoodEntry.find({
    userId: userId,
    date: { $gte: todayStart, $lt: tomorrow }
  });

  const nutritionTotals = todayNutrition.reduce((totals, food) => ({
    calories: totals.calories + food.calories,
    protein: totals.protein + food.protein,
    carbs: totals.carbs + food.carbs,
    fat: totals.fat + food.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return {
    user: {
      name: user.name,
      weight: profile.weight,
      height: profile.height,
      bmi: bmi,
      streak: user.streak || 0
    },
    weight: {
      current: profile.weight,
      trend: weightTrend,
      history: weightHistory.slice(-7) // Last 7 entries
    },
    workouts: workoutStats,
    nutrition: nutritionTotals,
    goals: user.fitnessPlan || {
      dailyCalories: 2000,
      proteinGoal: 150,
      carbsGoal: 250,
      fatGoal: 70
    },
    lastUpdated: new Date()
  };
}

// Calculate progress analytics
async function calculateProgressAnalytics(userId, timeframe) {
  let dateFilter = {};
  const now = new Date();
  
  if (timeframe === 'week') {
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    dateFilter.date = { $gte: weekAgo };
  } else if (timeframe === 'month') {
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
    dateFilter.date = { $gte: monthAgo };
  } else if (timeframe === 'quarter') {
    const quarterAgo = new Date(now.setMonth(now.getMonth() - 3));
    dateFilter.date = { $gte: quarterAgo };
  }

  // Get progress entries for timeframe
  const progressEntries = await Progress.find({
    userId: userId,
    ...dateFilter,
    weight: { $exists: true }
  }).sort({ date: 1 });

  // Get workouts for timeframe
  const workouts = await WorkoutSession.find({
    userId: userId,
    completed: true,
    completedAt: dateFilter.date
  });

  // Get nutrition data for timeframe
  const nutritionEntries = await FoodEntry.find({
    userId: userId,
    date: dateFilter.date
  });

  // Calculate weight analytics
  const weightAnalytics = calculateWeightAnalytics(progressEntries);
  
  // Calculate workout analytics
  const workoutAnalytics = calculateWorkoutAnalytics(workouts);
  
  // Calculate nutrition analytics
  const nutritionAnalytics = calculateNutritionAnalytics(nutritionEntries);

  return {
    weight: weightAnalytics,
    workouts: workoutAnalytics,
    nutrition: nutritionAnalytics,
    overallProgress: calculateOverallProgress(weightAnalytics, workoutAnalytics, nutritionAnalytics)
  };
}

// Calculate weight analytics
function calculateWeightAnalytics(progressEntries) {
  if (progressEntries.length === 0) {
    return {
      trend: 0,
      consistency: 0,
      totalChange: 0,
      weeklyAverage: 0,
      dataPoints: 0
    };
  }

  const weights = progressEntries.map(entry => entry.weight);
  const firstWeight = weights[0];
  const latestWeight = weights[weights.length - 1];
  const totalChange = latestWeight - firstWeight;
  
  // Calculate trend (simple linear regression)
  let trend = 0;
  if (weights.length > 1) {
    const xMean = (weights.length - 1) / 2;
    const yMean = weights.reduce((a, b) => a + b, 0) / weights.length;
    
    let numerator = 0;
    let denominator = 0;
    
    weights.forEach((weight, index) => {
      numerator += (index - xMean) * (weight - yMean);
      denominator += (index - xMean) ** 2;
    });
    
    trend = denominator !== 0 ? numerator / denominator : 0;
  }

  // Calculate consistency (how regularly weight is logged)
  const consistency = Math.min(100, (progressEntries.length / 30) * 100); // Based on 30 days

  return {
    trend: trend,
    consistency: Math.round(consistency),
    totalChange: parseFloat(totalChange.toFixed(1)),
    weeklyAverage: parseFloat((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)),
    dataPoints: weights.length
  };
}

// Calculate workout analytics
function calculateWorkoutAnalytics(workouts) {
  if (workouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalMinutes: 0,
      totalCalories: 0,
      avgDuration: 0,
      consistency: 0,
      frequency: 0
    };
  }

  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

  // Calculate workout frequency (workouts per week)
  const uniqueDays = new Set(workouts.map(w => 
    new Date(w.completedAt).toDateString()
  )).size;
  
  const frequency = (uniqueDays / 7) * 100; // Percentage of days with workouts

  return {
    totalWorkouts,
    totalMinutes,
    totalCalories,
    avgDuration,
    consistency: Math.round((totalWorkouts / 30) * 100), // Based on 30 days
    frequency: Math.round(frequency)
  };
}

// Calculate nutrition analytics
function calculateNutritionAnalytics(nutritionEntries) {
  if (nutritionEntries.length === 0) {
    return {
      totalCalories: 0,
      avgDailyCalories: 0,
      macroBalance: { protein: 0, carbs: 0, fat: 0 },
      consistency: 0
    };
  }

  // Group by date
  const dailyTotals = {};
  nutritionEntries.forEach(entry => {
    const date = entry.date.toDateString();
    if (!dailyTotals[date]) {
      dailyTotals[date] = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };
    }
    
    dailyTotals[date].calories += entry.calories;
    dailyTotals[date].protein += entry.protein;
    dailyTotals[date].carbs += entry.carbs;
    dailyTotals[date].fat += entry.fat;
  });

  const dailyValues = Object.values(dailyTotals);
  const totalCalories = dailyValues.reduce((sum, day) => sum + day.calories, 0);
  const avgDailyCalories = Math.round(totalCalories / dailyValues.length);

  // Calculate macro balance
  const totalMacros = dailyValues.reduce((macros, day) => ({
    protein: macros.protein + day.protein,
    carbs: macros.carbs + day.carbs,
    fat: macros.fat + day.fat
  }), { protein: 0, carbs: 0, fat: 0 });

  const macroTotal = totalMacros.protein + totalMacros.carbs + totalMacros.fat;
  const macroBalance = macroTotal > 0 ? {
    protein: Math.round((totalMacros.protein / macroTotal) * 100),
    carbs: Math.round((totalMacros.carbs / macroTotal) * 100),
    fat: Math.round((totalMacros.fat / macroTotal) * 100)
  } : { protein: 0, carbs: 0, fat: 0 };

  return {
    totalCalories,
    avgDailyCalories,
    macroBalance,
    consistency: Math.round((dailyValues.length / 30) * 100) // Based on 30 days
  };
}

// Calculate overall progress
function calculateOverallProgress(weightAnalytics, workoutAnalytics, nutritionAnalytics) {
  const weightScore = Math.max(0, 100 - Math.abs(weightAnalytics.trend) * 10);
  const workoutScore = workoutAnalytics.consistency;
  const nutritionScore = nutritionAnalytics.consistency;

  const overallScore = (weightScore + workoutScore + nutritionScore) / 3;

  return {
    score: Math.round(overallScore),
    trend: weightAnalytics.trend < 0 ? 'positive' : weightAnalytics.trend > 0 ? 'negative' : 'stable',
    areas: {
      weight: Math.round(weightScore),
      workouts: workoutScore,
      nutrition: nutritionScore
    }
  };
}

module.exports = exports;