const Workout = require('../models/Workout.model');

// Get user dashboard data
exports.getDashboard = async (req, res) => {
  try {
    // In a real app, you would fetch actual user data
    const dashboardData = {
      calories: { consumed: 1200, target: 2000 },
      steps: 8432,
      workoutTime: 45,
      water: { consumed: 4, target: 8 },
      todayWorkout: {
        title: 'Full Body Strength',
        duration: 45,
        exercises: 8
      },
      todayMeals: {
        breakfast: 'Oatmeal with berries',
        lunch: 'Grilled chicken salad',
        dinner: 'Salmon with vegetables'
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get workouts
exports.getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user._id });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create workout
exports.createWorkout = async (req, res) => {
  try {
    const workout = new Workout({
      userId: req.user._id,
      ...req.body
    });
    
    const savedWorkout = await workout.save();
    res.status(201).json(savedWorkout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Add to existing controller
exports.logWeight = async (req, res) => {
  try {
    const { weight, date } = req.body;
    // Here you would save to database
    res.json({ success: true, message: `Weight logged: ${weight}kg` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logFood = async (req, res) => {
  try {
    const { food, calories, mealType } = req.body;
    // Here you would save to database
    res.json({ success: true, message: `Food logged: ${food} for ${mealType}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};