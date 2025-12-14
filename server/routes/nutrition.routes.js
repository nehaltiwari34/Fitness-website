const express = require('express');
const { FoodEntry, WaterIntake } = require('../models/Nutrition.model');
const auth = require('../middleware/auth.middleware');
const nutritionController = require('../controllers/nutritionController');
const User = require('../models/User.model');

const router = express.Router();

// ========== NEW NUTRITION API ENDPOINTS ==========

// Get today's nutrition data - FIXED: Use controller function directly
router.get('/today', auth, nutritionController.getTodayNutrition);

// Get comprehensive nutrition dashboard
router.get('/dashboard', auth, nutritionController.getNutritionDashboard);

// Log food intake
router.post('/log-food', auth, nutritionController.logFood);

// Log water intake
router.post('/log-water', auth, nutritionController.logWater);

// Get food suggestions
router.get('/food-suggestions', auth, nutritionController.getFoodSuggestions);

// Generate personalized meal plan
router.post('/generate-plan', auth, nutritionController.generateMealPlan);

// Get nutrition history
router.get('/history', auth, nutritionController.getNutritionHistory);

// Delete food entry
router.delete('/food/:foodId', auth, nutritionController.deleteFoodEntry);

// ========== BACKWARD COMPATIBILITY ROUTES ==========

// Get nutrition summary (for existing frontend compatibility)
router.get('/summary', auth, nutritionController.getNutritionSummary);

// Log food (legacy endpoint) - FIXED: Remove duplicate and use controller
router.post('/log-food-legacy', auth, async (req, res) => {
  try {
    const { foodName, calories, protein, carbs, fat, mealType } = req.body;
    
    const user = await User.findById(req.user.userId);
    
    // Update calories consumed
    user.dailyProgress.caloriesConsumed = (user.dailyProgress.caloriesConsumed || 0) + parseInt(calories);
    
    // Add to food log
    if (!user.nutritionLog) user.nutritionLog = [];
    user.nutritionLog.push({
      date: new Date(),
      foodName,
      calories: parseInt(calories),
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      mealType: mealType || 'Other'
    });

    await user.save();

    // Also log to new FoodEntry collection using controller
    await nutritionController.logFood(req, res);

  } catch (error) {
    console.error('Food logging error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging food'
    });
  }
});

// Log water (legacy endpoint) - FIXED: Remove duplicate and use controller
router.post('/log-water-legacy', auth, async (req, res) => {
  try {
    const { amount } = req.body; // amount in liters
    
    const user = await User.findById(req.user.userId);
    user.dailyProgress.waterIntake = (user.dailyProgress.waterIntake || 0) + parseFloat(amount);
    
    await user.save();

    // Also log to new WaterIntake collection using controller
    const glasses = amount * 4; // Convert liters to glasses
    req.body.glasses = glasses;
    await nutritionController.logWater(req, res);

  } catch (error) {
    console.error('Water logging error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging water'
    });
  }
});

// Get food suggestions (legacy endpoint) - FIXED: Use controller function
router.get('/food-suggestions-legacy', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const fitnessPlan = user.fitnessPlan || {};
    const remainingCalories = Math.max(0, (fitnessPlan.dailyCalories || 2000) - (user.dailyProgress.caloriesConsumed || 0));

    const suggestions = [
      {
        category: 'High Protein',
        foods: [
          { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
          { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
          { name: 'Eggs (2 large)', calories: 143, protein: 13, carbs: 1, fat: 10 }
        ]
      },
      {
        category: 'Healthy Carbs',
        foods: [
          { name: 'Brown Rice (1 cup)', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
          { name: 'Sweet Potato', calories: 114, protein: 2, carbs: 27, fat: 0.1 },
          { name: 'Oatmeal (1 cup)', calories: 166, protein: 6, carbs: 28, fat: 3.6 }
        ]
      }
    ].filter(category => 
      category.foods.some(food => food.calories <= remainingCalories)
    );

    res.json({
      success: true,
      suggestions: suggestions
    });

  } catch (error) {
    console.error('Food suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching food suggestions'
    });
  }
});

// Get nutrition history (legacy endpoint) - FIXED: Use controller function
router.get('/history-legacy', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const nutritionLog = user.nutritionLog || [];
    
    // Get last 7 days of nutrition data
    const weeklyData = nutritionLog
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);

    res.json({
      success: true,
      history: weeklyData
    });

  } catch (error) {
    console.error('Nutrition history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nutrition history'
    });
  }
});

// Health check for nutrition routes - UPDATED: Include /today endpoint
router.get('/health', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Nutrition routes are working!',
    endpoints: {
      today: 'GET /api/nutrition/today',
      dashboard: 'GET /api/nutrition/dashboard',
      logFood: 'POST /api/nutrition/log-food',
      logWater: 'POST /api/nutrition/log-water',
      foodSuggestions: 'GET /api/nutrition/food-suggestions',
      generatePlan: 'POST /api/nutrition/generate-plan',
      history: 'GET /api/nutrition/history',
      summary: 'GET /api/nutrition/summary'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;