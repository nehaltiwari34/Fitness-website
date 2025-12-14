const express = require('express');
const auth = require('../middleware/auth.middleware');
const workoutController = require('../controllers/workoutController');
const { WorkoutSession, WorkoutPlan } = require('../models/Workout.model');

const router = express.Router();

// ========== PUBLIC TEST ROUTE ==========

// Public health check (no auth required)
router.get('/public-health', (req, res) => {
  res.json({
    success: true,
    message: 'Workout routes are mounted and working!',
    timestamp: new Date().toISOString()
  });
});

// ========== EXERCISE ROUTES ==========

// Get all exercises with filtering
router.get('/exercises', auth, workoutController.getExercises);

// Get specific exercise by ID
router.get('/exercises/:id', auth, workoutController.getExerciseById);

// ========== WORKOUT SESSION ROUTES ==========

// Start a new workout session
router.post('/sessions/start', auth, workoutController.startWorkout);

// Complete a workout session
router.post('/sessions/complete', auth, workoutController.completeWorkout);

// Get workout session history
router.get('/sessions/history', auth, workoutController.getWorkoutHistory);

router.get('/exercises', auth, workoutController.getExercises);

// Get specific workout session by ID
router.get('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await WorkoutSession.findById(req.params.id)
      .populate('exercises.exercise')
      .populate('userId', 'name profile.picture');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found'
      });
    }

    // Check if user owns this session
    if (session.userId._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this workout session'
      });
    }

    res.json({
      success: true,
      workoutSession: session
    });
  } catch (error) {
    console.error('Get workout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout session'
    });
  }
});

// ========== WORKOUT PLAN ROUTES ==========

// Get all workout plans for user
router.get('/plans', auth, workoutController.getWorkoutPlans);


// Create a new workout plan
router.post('/plans', auth, workoutController.createWorkoutPlan);

// Get specific workout plan by ID
router.get('/plans/:id', auth, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id)
      .populate('weeklySchedule.workouts.workout');
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    // Check if user owns this plan
    if (plan.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this workout plan'
      });
    }

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Get workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout plan'
    });
  }
});

// Update workout plan
router.put('/plans/:id', auth, async (req, res) => {
  try {
    const { name, description, goal, difficulty, duration, weeklySchedule, isActive } = req.body;
    
    const plan = await WorkoutPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    // Check if user owns this plan
    if (plan.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this workout plan'
      });
    }

    // Update plan fields
    if (name) plan.name = name;
    if (description) plan.description = description;
    if (goal) plan.goal = goal;
    if (difficulty) plan.difficulty = difficulty;
    if (duration) plan.duration = duration;
    if (weeklySchedule) plan.weeklySchedule = weeklySchedule;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();

    res.json({
      success: true,
      message: 'Workout plan updated successfully!',
      plan
    });
  } catch (error) {
    console.error('Update workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating workout plan'
    });
  }
});

// Delete workout plan
router.delete('/plans/:id', auth, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    // Check if user owns this plan
    if (plan.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this workout plan'
      });
    }

    await WorkoutPlan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Workout plan deleted successfully!'
    });
  } catch (error) {
    console.error('Delete workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting workout plan'
    });
  }
});

// ========== QUICK ACTIONS ROUTES ==========

// Log a quick workout
router.post('/quick-log', auth, workoutController.logQuickWorkout);

// ========== COMMENT ROUTES ==========

// Add comment to workout/exercise
router.post('/comments', auth, workoutController.addComment);

// Like/unlike a comment
router.post('/comments/:commentId/like', auth, workoutController.likeComment);

// ========== TODAY'S WORKOUT ROUTE ==========

// Get today's personalized workout - MAIN ENDPOINT
router.get('/today', auth, workoutController.getTodayWorkout);

// ========== REAL-TIME WORKOUT UPDATES ==========

// Real-time workout updates via Server-Sent Events
router.get('/:workoutId/live', auth, async (req, res) => {
  try {
    const workout = await WorkoutSession.findById(req.params.workoutId)
      .populate('exercises.exercise');
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Check if user owns this workout
    if (workout.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this workout'
      });
    }

    // Set up Server-Sent Events for real-time updates
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Send initial workout data
    res.write(`data: ${JSON.stringify({
      type: 'workout_data',
      workout: workout,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Set up interval for progress updates
    const interval = setInterval(() => {
      res.write(`data: ${JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
        activeUsers: Math.floor(Math.random() * 5) + 1
      })}\n\n`);
    }, 30000);

    // Handle client disconnect
    req.on('close', () => {
      console.log('Client disconnected from live workout');
      clearInterval(interval);
      res.end();
    });

  } catch (error) {
    console.error('Live workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up live workout'
    });
  }
});

// ========== WORKOUT STATISTICS ROUTES ==========

// Get workout statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { timeframe = 'all' } = req.query;
    
    // Get workout sessions for statistics
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
    });

    // Calculate statistics
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
    const avgCalories = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

    // Workout type distribution
    const typeDistribution = {};
    workouts.forEach(workout => {
      const type = workout.type || 'custom';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    // Recent workouts (last 5)
    const recentWorkouts = workouts
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .map(workout => ({
        name: workout.name,
        date: workout.completedAt,
        duration: workout.duration,
        calories: workout.caloriesBurned,
        type: workout.type
      }));

    res.json({
      success: true,
      stats: {
        totalWorkouts,
        totalDuration,
        totalCalories,
        avgDuration,
        avgCalories,
        typeDistribution,
        recentWorkouts,
        timeframe
      }
    });

  } catch (error) {
    console.error('Workout stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout statistics'
    });
  }
});

// ========== HEALTH CHECK ROUTE ==========

// Health check endpoint
router.get('/health', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Workout routes are working! 🏋️',
    endpoints: {
      today: 'GET /api/workouts/today - Get today workout',
      exercises: 'GET /api/workouts/exercises - Get exercise library',
      history: 'GET /api/workouts/sessions/history - Get workout history',
      start: 'POST /api/workouts/sessions/start - Start workout session',
      complete: 'POST /api/workouts/sessions/complete - Complete workout',
      plans: 'GET /api/workouts/plans - Get workout plans',
      quickLog: 'POST /api/workouts/quick-log - Log quick workout',
      stats: 'GET /api/workouts/stats/summary - Get workout statistics',
      health: 'GET /api/workouts/health - Health check'
    },
    user: {
      id: req.user.userId,
      authenticated: true
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== 404 HANDLER FOR WORKOUT ROUTES ==========

// Handle undefined workout routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Workout route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /api/workouts/today - Get personalized workout for today',
      'GET /api/workouts/exercises - Browse exercise library',
      'GET /api/workouts/sessions/history - View workout history',
      'POST /api/workouts/sessions/start - Start a new workout',
      'POST /api/workouts/sessions/complete - Complete a workout',
      'GET /api/workouts/plans - Get workout plans',
      'POST /api/workouts/quick-log - Log quick workout',
      'GET /api/workouts/health - Check route health'
    ]
  });
});

module.exports = router;