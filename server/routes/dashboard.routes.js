// server/routes/dashboard.routes.js - COMPLETE FILE
const express = require('express');
const auth = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Get comprehensive dashboard data
router.get('/', auth, dashboardController.getDashboardData);

// Health check endpoint
router.get('/health', auth, dashboardController.healthCheck);

module.exports = router;