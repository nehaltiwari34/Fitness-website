// routes/workoutRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUserPlan,
  getExercises,
  getPrograms,
  getWorkoutHistory
} = require('../controllers/workoutController');

// All routes protected with authentication
router.get('/plan', auth, getUserPlan);
router.get('/exercises', auth, getExercises);
router.get('/programs', auth, getPrograms);
router.get('/history', auth, getWorkoutHistory);

module.exports = router;