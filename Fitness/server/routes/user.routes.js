const express = require('express');
const { getDashboard, getWorkouts, createWorkout, logWeight, logFood } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, getDashboard);
router.get('/workouts', protect, getWorkouts);
router.post('/workouts', protect, createWorkout);
router.post('/log-weight', protect, logWeight);
router.post('/log-food', protect, logFood);

module.exports = router;