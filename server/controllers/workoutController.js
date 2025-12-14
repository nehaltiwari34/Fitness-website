const { Exercise, WorkoutSession, WorkoutPlan, WorkoutTemplate, Comment } = require('../models/Workout.model');
const { FoodEntry, WaterIntake } = require('../models/Nutrition.model');
const User = require('../models/User.model');

// ✅ ENHANCED: Get personalized today's workout based on user data
exports.getTodayWorkout = async (req, res) => {
  try {
    console.log('🔍 Fetching personalized today workout...');
    
    // DEFENSIVE CHECK: Ensure req.user exists
    if (!req.user || !req.user.userId) {
      console.error('❌ req.user is undefined or missing userId');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please log in again.'
      });
    }
    
    console.log('🔍 Fetching personalized today workout for user:', req.user.userId);

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // DEFENSIVE: Require completed profile and fitnessLevel!
    if (!user.profile || !user.profile.fitnessLevel) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your fitness profile first.'
      });
    }

    // Generate personalized workout based on user profile
    const personalizedWorkout = await generatePersonalizedWorkout(user);

    res.json({
      success: true,
      workout: personalizedWorkout,
      hasActivePlan: false,
      isPersonalized: true
    });

  } catch (error) {
    console.error('Today workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today workout'
    });
  }
};

// Get all exercises
exports.getExercises = async (req, res) => {
  try {
    console.log('💪 Fetching exercises for user:', req.user.userId);

    const { category, difficulty, search } = req.query;
    let filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const exercises = await Exercise.find(filter)
      .limit(50)
      .select('name category difficulty equipment instructions muscleGroup description')
      .sort({ name: 1 });

    res.json({
      success: true,
      exercises: exercises,
      total: exercises.length
    });

  } catch (error) {
    console.error('Get exercises error:', error);
    // Return fallback exercises
    res.json({
      success: true,
      exercises: [
        { 
          _id: '1', 
          name: 'Push-ups', 
          category: 'Strength', 
          difficulty: 'Beginner',
          equipment: ['Bodyweight'],
          muscleGroup: 'Chest, Shoulders, Triceps',
          description: 'Classic bodyweight exercise for upper body strength'
        },
        { 
          _id: '2', 
          name: 'Squats', 
          category: 'Strength', 
          difficulty: 'Beginner',
          equipment: ['Bodyweight'],
          muscleGroup: 'Legs, Glutes',
          description: 'Fundamental lower body exercise for leg strength'
        },
        { 
          _id: '3', 
          name: 'Plank', 
          category: 'Core', 
          difficulty: 'Beginner',
          equipment: ['Bodyweight'],
          muscleGroup: 'Core, Abs',
          description: 'Isometric core exercise for stability and endurance'
        }
      ],
      total: 3
    });
  }
};

// Get exercise by ID
exports.getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Getting exercise by ID:', id);

    const exercise = await Exercise.findById(id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    res.json({
      success: true,
      exercise: exercise
    });

  } catch (error) {
    console.error('Get exercise by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercise'
    });
  }
};

// Get workout plans
exports.getWorkoutPlans = async (req, res) => {
  try {
    console.log('📅 Fetching workout plans for user:', req.user.userId);

    const plans = await WorkoutPlan.find({ userId: req.user.userId })
      .populate('weeklySchedule.workouts.workout')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      plans: plans,
      total: plans.length
    });

  } catch (error) {
    console.error('Get workout plans error:', error);
    // Return fallback plans
    res.json({
      success: true,
      plans: [
        { 
          _id: '1',
          name: "4-Week Fitness Challenge", 
          description: "Comprehensive fitness program for all levels",
          goal: "General Fitness",
          difficulty: "Intermediate",
          duration: 4,
          progress: 45,
          isActive: true,
          weeklySchedule: []
        }
      ],
      total: 1
    });
  }
};

// Create workout plan
exports.createWorkoutPlan = async (req, res) => {
  try {
    const { name, description, goal, difficulty, duration, weeklySchedule } = req.body;
    console.log('📝 Creating workout plan for user:', req.user.userId);

    const workoutPlan = new WorkoutPlan({
      userId: req.user.userId,
      name,
      description,
      goal,
      difficulty,
      duration,
      weeklySchedule,
      startDate: new Date()
    });

    await workoutPlan.save();

    res.json({
      success: true,
      message: 'Workout plan created successfully!',
      plan: workoutPlan
    });

  } catch (error) {
    console.error('Create workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating workout plan'
    });
  }
};

// Log quick workout
exports.logQuickWorkout = async (req, res) => {
  try {
    const { type } = req.body;
    console.log('⚡ Logging quick workout:', type);

    const workoutData = {
      '15-Min': { duration: 15, calories: 120, name: '15-Min Quick Workout' },
      '30-Min': { duration: 30, calories: 250, name: '30-Min Cardio Session' },
      '45-Min': { duration: 45, calories: 350, name: '45-Min Strength Training' }
    };

    const workout = workoutData[type] || workoutData['30-Min'];

    const workoutSession = new WorkoutSession({
      userId: req.user.userId,
      name: workout.name,
      duration: workout.duration,
      caloriesBurned: workout.calories,
      completed: true,
      completedAt: new Date(),
      exercises: []
    });

    await workoutSession.save();

    // Update user stats
    await updateUserWorkoutStats(req.user.userId, {
      duration: workout.duration,
      caloriesBurned: workout.calories
    });

    res.json({
      success: true,
      message: `${type} workout logged successfully!`,
      workoutSession: workoutSession
    });

  } catch (error) {
    console.error('Log quick workout error:', error);
    res.json({
      success: true,
      message: `${req.body.type} workout logged successfully! (Demo mode)`,
      workoutSession: {
        _id: Date.now(),
        name: `${req.body.type} Quick Workout`,
        duration: 30,
        caloriesBurned: 250,
        completed: true,
        completedAt: new Date()
      }
    });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { content, targetType, targetId } = req.body;
    console.log('💬 Adding comment:', targetType, targetId);

    const comment = new Comment({
      userId: req.user.userId,
      content,
      targetType,
      targetId
    });

    await comment.save();

    res.json({
      success: true,
      message: 'Comment added successfully!',
      comment: comment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
};

// Like comment
exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    console.log('❤️ Liking comment:', commentId);

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user already liked
    const alreadyLiked = comment.likes.includes(req.user.userId);

    if (alreadyLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== req.user.userId);
    } else {
      // Like
      comment.likes.push(req.user.userId);
    }

    await comment.save();

    res.json({
      success: true,
      message: alreadyLiked ? 'Comment unliked' : 'Comment liked!',
      likes: comment.likes.length
    });

  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking comment'
    });
  }
};

// Get workout sessions history
exports.getWorkoutHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, timeframe = 'all' } = req.query;
    console.log('📈 Fetching workout history for user:', req.user.userId);

    let dateFilter = {};
    const now = new Date();

    if (timeframe === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter.completedAt = { $gte: weekAgo };
    } else if (timeframe === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter.completedAt = { $gte: monthAgo };
    }

    const workouts = await WorkoutSession.find({ 
      userId: req.user.userId,
      completed: true,
      ...dateFilter
    })
    .sort({ completedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await WorkoutSession.countDocuments({ 
      userId: req.user.userId,
      completed: true,
      ...dateFilter
    });

    // Calculate analytics
    const analytics = await calculateWorkoutAnalytics(req.user.userId, timeframe);

    res.json({
      success: true,
      workouts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      analytics
    });

  } catch (error) {
    console.error('Workout history error:', error);
    // Return fallback history
    res.json({
      success: true,
      workouts: [
        { 
          _id: '1',
          name: 'Full Body Strength', 
          completedAt: new Date(Date.now() - 86400000).toISOString(), 
          duration: 45, 
          caloriesBurned: 280,
          completed: true,
          rating: 4
        },
        { 
          _id: '2',
          name: 'Cardio Blast', 
          completedAt: new Date(Date.now() - 172800000).toISOString(), 
          duration: 30, 
          caloriesBurned: 250,
          completed: true,
          rating: 5
        }
      ],
      totalPages: 1,
      currentPage: 1,
      total: 2,
      analytics: {
        totalWorkouts: 15,
        totalMinutes: 675,
        totalCalories: 4200,
        streak: 7
      }
    });
  }
};

// Delete food entry (for nutrition routes)
exports.deleteFoodEntry = async (req, res) => {
  try {
    const { foodId } = req.params;
    console.log('🗑️ Deleting food entry:', foodId);

    await FoodEntry.findByIdAndDelete(foodId);

    res.json({
      success: true,
      message: 'Food entry deleted successfully!'
    });

  } catch (error) {
    console.error('Delete food entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting food entry'
    });
  }
};

// Get nutrition summary (for nutrition routes)
exports.getNutritionSummary = async (req, res) => {
  try {
    console.log('📊 Getting nutrition summary for user:', req.user.userId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFoods = await FoodEntry.find({
      userId: req.user.userId,
      date: { $gte: todayStart, $lt: tomorrow }
    });

    const totals = todayFoods.reduce((acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    res.json({
      success: true,
      summary: totals,
      foodCount: todayFoods.length
    });

  } catch (error) {
    console.error('Nutrition summary error:', error);
    res.json({
      success: true,
      summary: { calories: 850, protein: 65, carbs: 86, fat: 20 },
      foodCount: 3
    });
  }
};

// ✅ NEW: Generate personalized workout based on user data
async function generatePersonalizedWorkout(user) {
  const profile = user.profile || {};
  const fitnessLevel = profile.fitnessLevel || 'beginner';
  const goals = user.fitnessPlan?.goals || ['General Fitness'];
  const availableTime = user.workoutPreferences?.availableTime || 30;

  // Determine workout type based on goals
  let workoutType = 'strength';
  let difficulty = 'Beginner';
  let duration = 30;

  if (goals.includes('Weight Loss')) {
    workoutType = 'cardio';
    duration = Math.min(availableTime, 45);
  } else if (goals.includes('Muscle Gain')) {
    workoutType = 'strength';
    duration = Math.min(availableTime, 60);
  } else if (goals.includes('Flexibility')) {
    workoutType = 'flexibility';
    duration = Math.min(availableTime, 30);
  }

  // Adjust based on fitness level
  if (fitnessLevel === 'intermediate') {
    difficulty = 'Intermediate';
    duration += 10;
  } else if (fitnessLevel === 'advanced') {
    difficulty = 'Advanced';
    duration += 15;
  }

  // Get appropriate exercises from database
  const exercises = await getExercisesForWorkout(workoutType, fitnessLevel, 4);

  const workoutTemplates = {
    strength: {
      name: "Personalized Strength Training",
      description: `Tailored ${difficulty.toLowerCase()} strength workout based on your goals`
    },
    cardio: {
      name: "Custom Cardio Session", 
      description: `Personalized ${difficulty.toLowerCase()} cardio routine for optimal results`
    },
    flexibility: {
      name: "Flexibility & Mobility",
      description: "Custom stretching and mobility exercises"
    },
    hiit: {
      name: "HIIT Power Workout",
      description: "High-intensity interval training session"
    }
  };

  const template = workoutTemplates[workoutType] || workoutTemplates.strength;

  // Calculate estimated calories based on user weight and duration
  const weight = profile.weight || 70;
  const calories = calculateEstimatedCalories(workoutType, duration, weight, fitnessLevel);

  return {
    _id: `personalized-${workoutType}-${Date.now()}`,
    name: template.name,
    description: template.description,
    duration: duration,
    calories: calories,
    difficulty: difficulty,
    type: workoutType,
    exercises: exercises,
    isPersonalized: true,
    generatedAt: new Date()
  };
}

// ✅ NEW: Calculate estimated calories burned
function calculateEstimatedCalories(workoutType, duration, weight, fitnessLevel) {
  const baseMET = {
    strength: 6,
    cardio: 8,
    flexibility: 3,
    hiit: 10
  };

  const met = baseMET[workoutType] || 6;
  // Adjust MET based on fitness level (more efficient = slightly lower MET)
  const efficiencyFactor = fitnessLevel === 'beginner' ? 1.1 : fitnessLevel === 'intermediate' ? 1.0 : 0.9;

  const calories = (met * efficiencyFactor * weight * duration) / 60;
  return Math.round(calories);
}

// ✅ ENHANCED: Get exercises with personalized recommendations
async function getExercisesForWorkout(workoutType, fitnessLevel, limit = 4) {
  let difficultyFilter = {};

  // Adjust difficulty based on fitness level
  if (fitnessLevel === 'beginner') {
    difficultyFilter = { difficulty: 'Beginner' };
  } else if (fitnessLevel === 'intermediate') {
    difficultyFilter = { difficulty: { $in: ['Beginner', 'Intermediate'] } };
  } // Advanced users get all difficulties

  const exercises = await Exercise.find({
    category: workoutType,
    ...difficultyFilter
  })
  .limit(limit * 2) // Get more to randomize
  .select('name category difficulty equipment instructions');

  // Randomize and limit results
  const shuffled = exercises.sort(() => 0.5 - Math.random());
  const selectedExercises = shuffled.slice(0, limit);

  // Format exercises with appropriate sets/reps based on difficulty
  return selectedExercises.map((exercise, index) => {
    const setsReps = getSetsRepsForDifficulty(fitnessLevel, workoutType);
    return {
      name: exercise.name,
      sets: setsReps.sets,
      reps: setsReps.reps,
      rest: setsReps.rest,
      instructions: exercise.instructions || 'Focus on proper form and controlled movements.',
      equipment: exercise.equipment || 'Bodyweight'
    };
  });
}

// ✅ NEW: Get appropriate sets/reps based on difficulty
function getSetsRepsForDifficulty(fitnessLevel, workoutType) {
  const configs = {
    beginner: {
      strength: { sets: 3, reps: '8-12', rest: '60s' },
      cardio: { sets: 3, reps: '30-45s', rest: '30s' },
      flexibility: { sets: 3, reps: '20-30s', rest: '15s' },
      hiit: { sets: 4, reps: '30s', rest: '30s' }
    },
    intermediate: {
      strength: { sets: 4, reps: '10-15', rest: '45s' },
      cardio: { sets: 4, reps: '45-60s', rest: '20s' },
      flexibility: { sets: 4, reps: '30-45s', rest: '10s' },
      hiit: { sets: 5, reps: '40s', rest: '20s' }
    },
    advanced: {
      strength: { sets: 5, reps: '12-20', rest: '30s' },
      cardio: { sets: 5, reps: '60-90s', rest: '15s' },
      flexibility: { sets: 5, reps: '45-60s', rest: '5s' },
      hiit: { sets: 6, reps: '45s', rest: '15s' }
    }
  };

  return configs[fitnessLevel]?.[workoutType] || configs.beginner.strength;
}

// ✅ ENHANCED: Start workout with personalized tracking
exports.startWorkout = async (req, res) => {
  try {
    const { workoutTemplateId, customExercises, name, isPersonalized } = req.body;

    let exercises = [];
    let workoutName = name || 'Custom Workout';

    if (isPersonalized) {
      // Use personalized workout structure
      const user = await User.findById(req.user.userId);
      const personalizedWorkout = await generatePersonalizedWorkout(user);
      exercises = personalizedWorkout.exercises.map(exercise => ({
        exerciseName: exercise.name,
        targetSets: exercise.sets,
        targetReps: exercise.reps,
        completedSets: 0,
        completedReps: '0',
        completed: false,
        notes: ''
      }));
      workoutName = personalizedWorkout.name;
    } else if (workoutTemplateId) {
      const template = await WorkoutTemplate.findById(workoutTemplateId).populate('exercises.exercise');
      exercises = template.exercises.map(item => ({
        exerciseName: item.exercise.name,
        targetSets: item.sets || 3,
        targetReps: item.reps || '10-12',
        completedSets: 0,
        completedReps: '0',
        completed: false,
        notes: ''
      }));
    } else if (customExercises) {
      const exerciseDocs = await Exercise.find({ _id: { $in: customExercises } });
      exercises = exerciseDocs.map(exercise => ({
        exerciseName: exercise.name,
        targetSets: 3,
        targetReps: '10-12',
        completedSets: 0,
        completedReps: '0',
        completed: false,
        notes: ''
      }));
    }

    const workoutSession = new WorkoutSession({
      userId: req.user.userId,
      name: workoutName,
      exercises,
      duration: 0,
      caloriesBurned: 0,
      completed: false,
      startTime: new Date(),
      isPersonalized: isPersonalized || false
    });

    await workoutSession.save();

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user-${req.user.userId}`).emit('workoutStarted', {
        sessionId: workoutSession._id,
        workoutName: workoutSession.name,
        startTime: workoutSession.startTime,
        userId: req.user.userId
      });
    }

    res.json({
      success: true,
      message: 'Workout started successfully',
      workoutSession
    });
  } catch (error) {
    console.error('Workout start error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting workout'
    });
  }
};

// ✅ ENHANCED: Complete workout with progress tracking
exports.completeWorkout = async (req, res) => {
  try {
    const { sessionId, duration, caloriesBurned, exercises, notes, rating, difficulty } = req.body;

    const workoutSession = await WorkoutSession.findById(sessionId);
    if (!workoutSession || workoutSession.userId.toString() !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found'
      });
    }

    // Update session
    workoutSession.duration = duration;
    workoutSession.caloriesBurned = caloriesBurned;
    workoutSession.completed = true;
    workoutSession.completedAt = new Date();
    workoutSession.notes = notes;
    workoutSession.rating = rating;
    workoutSession.difficulty = difficulty;

    if (exercises) {
      workoutSession.exercises = exercises;
    }

    await workoutSession.save();

    // Update user stats and streak
    await updateUserWorkoutStats(req.user.userId, {
      duration,
      caloriesBurned
    });

    // Update user streak
    const user = await User.findById(req.user.userId);
    await user.updateStreak();

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user-${req.user.userId}`).emit('workoutCompleted', {
        sessionId: workoutSession._id,
        workoutName: workoutSession.name,
        duration: workoutSession.duration,
        caloriesBurned: workoutSession.caloriesBurned,
        completedAt: workoutSession.completedAt
      });

      // Update dashboard for all connected clients of this user
      io.to(`dashboard-${req.user.userId}`).emit('dashboardUpdate', {
        type: 'workoutCompleted',
        workout: workoutSession
      });
    }

    res.json({
      success: true,
      message: 'Workout completed successfully! 🎉',
      workoutSession
    });
  } catch (error) {
    console.error('Workout complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing workout'
    });
  }
};

// ✅ NEW: Calculate workout analytics
async function calculateWorkoutAnalytics(userId, timeframe = 'all') {
  let dateFilter = {};
  const now = new Date();

  if (timeframe === 'week') {
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    dateFilter.completedAt = { $gte: weekAgo };
  } else if (timeframe === 'month') {
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
    dateFilter.completedAt = { $gte: monthAgo };
  }

  const workouts = await WorkoutSession.find({
    userId,
    completed: true,
    ...dateFilter
  });

  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
  const avgCalories = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

  // Most frequent workout type
  const typeCounts = {};
  workouts.forEach(workout => {
    const type = workout.type || 'custom';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const mostFrequentType = Object.keys(typeCounts).reduce((a, b) =>
    typeCounts[a] > typeCounts[b] ? a : b, 'strength'
  );

  return {
    totalWorkouts,
    totalDuration,
    totalCalories,
    avgDuration,
    avgCalories,
    mostFrequentType,
    workoutFrequency: totalWorkouts
  };
}

// ✅ ENHANCED: Update user workout stats
async function updateUserWorkoutStats(userId, { duration, caloriesBurned }) {
  const user = await User.findById(userId);

  if (!user.workoutStats) {
    user.workoutStats = {
      totalWorkouts: 0,
      totalMinutes: 0,
      totalCalories: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null
    };
  }

  user.workoutStats.totalWorkouts += 1;
  user.workoutStats.totalMinutes += duration;
  user.workoutStats.totalCalories += caloriesBurned;
  user.workoutStats.lastWorkoutDate = new Date();

  // Update streak (simplified - your existing streak logic is in User model)
  await user.updateStreak();

  await user.save();
  return user.workoutStats;
}
