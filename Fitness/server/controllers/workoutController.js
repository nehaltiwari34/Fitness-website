// controllers/workoutController.js
const UserPlan = require('../models/UserPlan');
const Exercise = require('../models/Exercise');
const Program = require('../models/Program');
const WorkoutHistory = require('../models/WorkoutHistory');

exports.getUserPlan = async (req, res) => {
  try {
    const userPlan = await UserPlan.findOne({ user: req.user.id })
      .populate('workouts.workoutId')
      .populate('currentProgram');
    
    if (!userPlan) {
      return res.status(404).json({ message: 'User plan not found' });
    }
    
    res.json(userPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExercises = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const exercises = await Exercise.find()
      .limit(limit)
      .select('name muscleGroup equipment difficulty');
    
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPrograms = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const programs = await Program.find()
      .limit(limit)
      .select('name duration difficulty goal');
    
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkoutHistory = async (req, res) => {
  try {
    const history = await WorkoutHistory.findOne({ user: req.user.id })
      .sort({ date: -1 })
      .limit(10)
      .populate('workouts.workoutId');
    
    const stats = await WorkoutHistory.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalCalories: { $sum: '$caloriesBurned' }
        }
      }
    ]);
    
    res.json({
      recentWorkouts: history || [],
      totalWorkouts: stats[0]?.totalWorkouts || 0,
      totalCalories: stats[0]?.totalCalories || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};