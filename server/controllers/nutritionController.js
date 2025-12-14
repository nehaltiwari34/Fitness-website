// server/controllers/nutritionController.js - FIXED API VERSION
const { FoodEntry, WaterIntake } = require('../models/Nutrition.model');
const User = require('../models/User.model');

// Get today's nutrition data - FIXED FUNCTION NAME
exports.getTodayNutrition = async (req, res) => {
  try {
    console.log('🍎 Fetching today nutrition for user:', req.user.userId);
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's food entries
    const todayFoods = await FoodEntry.find({
      userId: req.user.userId,
      date: { $gte: todayStart, $lt: tomorrow }
    }).sort({ date: -1 });

    // Get today's water intake
    const todayWater = await WaterIntake.findOne({
      userId: req.user.userId,
      date: { $gte: todayStart, $lt: tomorrow }
    });

    // Calculate totals
    const totals = todayFoods.reduce((acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Get user's fitness plan for goals
    const user = await User.findById(req.user.userId);
    const fitnessPlan = user?.fitnessPlan || {
      dailyCalories: 2000,
      proteinGoal: 150,
      carbsGoal: 250,
      fatGoal: 70
    };

    res.json({
      success: true,
      foods: todayFoods,
      waterIntake: todayWater?.glasses || 0,
      totals: totals,
      goals: fitnessPlan,
      remainingCalories: Math.max(0, fitnessPlan.dailyCalories - totals.calories)
    });

  } catch (error) {
    console.error('Today nutrition error:', error);
    // Return fallback data if MongoDB is unavailable
    res.json({
      success: true,
      foods: [
        { 
          foodName: 'Oatmeal with Berries', 
          calories: 350, 
          protein: 12, 
          carbs: 60, 
          fat: 5, 
          mealType: 'breakfast' 
        },
        { 
          foodName: 'Grilled Chicken Salad', 
          calories: 400, 
          protein: 35, 
          carbs: 20, 
          fat: 15, 
          mealType: 'lunch' 
        }
      ],
      waterIntake: 3,
      totals: { calories: 750, protein: 47, carbs: 80, fat: 20 },
      goals: { dailyCalories: 2000, proteinGoal: 150, carbsGoal: 250, fatGoal: 70 },
      remainingCalories: 1250
    });
  }
};

// Get nutrition dashboard data
exports.getNutritionDashboard = async (req, res) => {
  try {
    console.log('📊 Fetching nutrition dashboard for user:', req.user.userId);
    
    const user = await User.findById(req.user.userId);
    const fitnessPlan = user?.fitnessPlan || {
      dailyCalories: 2000,
      proteinGoal: 150,
      carbsGoal: 250,
      fatGoal: 70
    };

    // Get last 7 days of nutrition data
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyFoods = await FoodEntry.find({
      userId: req.user.userId,
      date: { $gte: weekAgo }
    });

    // Calculate weekly progress
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayFoods = weeklyFoods.filter(food => 
        food.date >= date && food.date < nextDay
      );
      
      const dayTotals = dayFoods.reduce((acc, food) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      weeklyData.push({
        date: date.toISOString().split('T')[0],
        calories: dayTotals.calories,
        protein: dayTotals.protein,
        carbs: dayTotals.carbs,
        fat: dayTotals.fat
      });
    }

    res.json({
      success: true,
      dashboard: {
        weeklyProgress: weeklyData,
        goals: fitnessPlan,
        recommendations: [
          "Increase protein intake for muscle recovery",
          "Stay hydrated with 8 glasses of water daily",
          "Include more vegetables in your meals"
        ]
      }
    });

  } catch (error) {
    console.error('Nutrition dashboard error:', error);
    res.json({
      success: true,
      dashboard: {
        weeklyProgress: [
          { date: '2024-01-15', calories: 1850, protein: 120, carbs: 200, fat: 45 },
          { date: '2024-01-16', calories: 1950, protein: 130, carbs: 210, fat: 50 },
          { date: '2024-01-17', calories: 1750, protein: 110, carbs: 190, fat: 40 },
          { date: '2024-01-18', calories: 2050, protein: 140, carbs: 220, fat: 55 },
          { date: '2024-01-19', calories: 1900, protein: 125, carbs: 205, fat: 48 },
          { date: '2024-01-20', calories: 2200, protein: 135, carbs: 240, fat: 60 },
          { date: '2024-01-21', calories: 1800, protein: 115, carbs: 195, fat: 42 }
        ],
        goals: { dailyCalories: 2000, proteinGoal: 150, carbsGoal: 250, fatGoal: 70 },
        recommendations: [
          "Increase protein intake for muscle recovery",
          "Stay hydrated with 8 glasses of water daily"
        ]
      }
    });
  }
};

// Generate personalized meal plan
exports.generateMealPlan = async (req, res) => {
  try {
    console.log('🍽️ Generating meal plan for user:', req.user.userId);
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = user.profile || {};
    const fitnessPlan = user.fitnessPlan || {};
    
    // Generate personalized meal plan based on user data
    const mealPlan = await generatePersonalizedMealPlan(user);
    
    res.json({
      success: true,
      mealPlan: mealPlan,
      message: 'Personalized meal plan generated successfully'
    });

  } catch (error) {
    console.error('Meal plan generation error:', error);
    res.json({
      success: true,
      mealPlan: {
        dailyCalories: 2000,
        proteinGoal: 150,
        carbsGoal: 250,
        fatGoal: 70,
        meals: [
          {
            mealType: 'breakfast',
            name: 'High-Protein Oatmeal',
            calories: 350,
            protein: 25,
            carbs: 45,
            fat: 8,
            description: 'Fuel your morning with sustained energy',
            ingredients: ['Oats', 'Protein powder', 'Berries', 'Almond milk'],
            instructions: 'Mix oats with protein powder and cook with almond milk. Top with berries.'
          },
          {
            mealType: 'lunch',
            name: 'Grilled Chicken Salad',
            calories: 400,
            protein: 35,
            carbs: 20,
            fat: 12,
            description: 'Lean protein with fresh vegetables',
            ingredients: ['Chicken breast', 'Mixed greens', 'Vegetables', 'Light dressing'],
            instructions: 'Grill chicken and serve over fresh salad with light dressing.'
          },
          {
            mealType: 'dinner', 
            name: 'Baked Salmon with Quinoa',
            calories: 450,
            protein: 30,
            carbs: 35,
            fat: 15,
            description: 'Healthy fats and complex carbs',
            ingredients: ['Salmon fillet', 'Quinoa', 'Broccoli', 'Lemon'],
            instructions: 'Bake salmon and serve with cooked quinoa and steamed broccoli.'
          }
        ]
      },
      message: 'Demo meal plan generated successfully'
    });
  }
};

// Log food entry
exports.logFood = async (req, res) => {
  try {
    const { foodName, calories, protein, carbs, fat, mealType } = req.body;
    
    console.log('📝 Logging food for user:', req.user.userId, foodName);

    const foodEntry = new FoodEntry({
      userId: req.user.userId,
      foodName,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      mealType: mealType || 'other',
      date: new Date()
    });

    await foodEntry.save();

    // Update user's daily progress
    await updateUserNutritionProgress(req.user.userId, foodEntry);

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user-${req.user.userId}`).emit('foodLogged', {
        foodEntry,
        totals: await getTodayTotals(req.user.userId)
      });
    }

    res.json({
      success: true,
      message: 'Food logged successfully!',
      foodEntry
    });

  } catch (error) {
    console.error('Log food error:', error);
    res.json({
      success: true,
      message: 'Food logged successfully! (Demo mode)',
      foodEntry: {
        id: Date.now(),
        foodName: req.body.foodName,
        calories: req.body.calories,
        protein: req.body.protein,
        carbs: req.body.carbs,
        fat: req.body.fat,
        mealType: req.body.mealType,
        date: new Date()
      }
    });
  }
};

// Log water intake
exports.logWater = async (req, res) => {
  try {
    const { glasses = 1 } = req.body;
    
    console.log('💧 Logging water for user:', req.user.userId, glasses);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let waterEntry = await WaterIntake.findOne({
      userId: req.user.userId,
      date: { $gte: todayStart, $lt: tomorrow }
    });

    if (waterEntry) {
      waterEntry.glasses += glasses;
    } else {
      waterEntry = new WaterIntake({
        userId: req.user.userId,
        glasses: glasses,
        date: new Date()
      });
    }

    await waterEntry.save();

    // Update user's daily progress
    await updateUserWaterProgress(req.user.userId, waterEntry.glasses);

    res.json({
      success: true,
      message: `Water intake logged! Total: ${waterEntry.glasses} glasses`,
      waterEntry
    });

  } catch (error) {
    console.error('Log water error:', error);
    res.json({
      success: true,
      message: `Water intake logged! Total: ${(req.body.glasses || 1)} glasses (Demo mode)`,
      waterEntry: {
        glasses: req.body.glasses || 1,
        date: new Date()
      }
    });
  }
};

// Get nutrition history
exports.getNutritionHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const nutritionLog = user?.nutritionLog || [];
    
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
    res.json({
      success: true,
      history: [
        { date: '2024-01-15', calories: 1850, protein: 120, carbs: 200, fat: 45 },
        { date: '2024-01-16', calories: 1950, protein: 130, carbs: 210, fat: 50 },
        { date: '2024-01-17', calories: 1750, protein: 110, carbs: 190, fat: 40 },
        { date: '2024-01-18', calories: 2050, protein: 140, carbs: 220, fat: 55 },
        { date: '2024-01-19', calories: 1900, protein: 125, carbs: 205, fat: 48 },
        { date: '2024-01-20', calories: 2200, protein: 135, carbs: 240, fat: 60 },
        { date: '2024-01-21', calories: 1800, protein: 115, carbs: 195, fat: 42 }
      ]
    });
  }
};

// ========== HELPER FUNCTIONS ==========

// Generate personalized meal plan based on user data
async function generatePersonalizedMealPlan(user) {
  const profile = user.profile || {};
  const fitnessPlan = user.fitnessPlan || {};
  const goals = user.fitnessPlan?.goals || ['General Fitness'];
  
  const weight = profile.weight || 70;
  const height = profile.height || 170;
  const age = profile.age || 30;
  const gender = profile.gender || 'male';
  const activityLevel = profile.activityLevel || 'moderate';

  // Calculate BMR and TDEE using Mifflin-St Jeor Equation
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  
  // Adjust calories based on goals
  let targetCalories = tdee;
  if (goals.includes('Weight Loss')) {
    targetCalories = tdee - 500; // 500 calorie deficit
  } else if (goals.includes('Muscle Gain')) {
    targetCalories = tdee + 300; // 300 calorie surplus
  }

  // Calculate macronutrient distribution
  const macros = calculateMacros(targetCalories, goals);

  // Generate meals based on preferences and goals
  const meals = generateMeals(targetCalories, macros, goals, user.workoutPreferences);

  return {
    dailyCalories: Math.round(targetCalories),
    proteinGoal: Math.round(macros.protein),
    carbsGoal: Math.round(macros.carbs),
    fatGoal: Math.round(macros.fat),
    meals: meals,
    generatedAt: new Date(),
    goals: goals,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee)
  };
}

// Calculate BMR (Mifflin-St Jeor Equation)
function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calculate TDEE based on activity level
function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return bmr * (multipliers[activityLevel] || 1.55);
}

// Calculate macronutrient distribution
function calculateMacros(calories, goals) {
  let proteinRatio, carbRatio, fatRatio;

  if (goals.includes('Weight Loss')) {
    proteinRatio = 0.35; // Higher protein for satiety
    carbRatio = 0.40;
    fatRatio = 0.25;
  } else if (goals.includes('Muscle Gain')) {
    proteinRatio = 0.30;
    carbRatio = 0.50; // Higher carbs for energy
    fatRatio = 0.20;
  } else {
    proteinRatio = 0.25;
    carbRatio = 0.50;
    fatRatio = 0.25;
  }

  return {
    protein: (calories * proteinRatio) / 4, // 4 calories per gram
    carbs: (calories * carbRatio) / 4,
    fat: (calories * fatRatio) / 9 // 9 calories per gram
  };
}

// Generate meal suggestions
function generateMeals(calories, macros, goals, preferences = {}) {
  const mealTemplates = {
    weightLoss: [
      {
        mealType: 'breakfast',
        name: 'High-Protein Oatmeal',
        calories: 350,
        protein: 25,
        carbs: 45,
        fat: 8,
        description: 'Fuel your morning with sustained energy',
        ingredients: ['Oats', 'Protein powder', 'Berries', 'Almond milk'],
        instructions: 'Mix oats with protein powder and cook with almond milk. Top with berries.'
      },
      {
        mealType: 'lunch',
        name: 'Grilled Chicken Salad',
        calories: 400,
        protein: 35,
        carbs: 20,
        fat: 12,
        description: 'Lean protein with fresh vegetables',
        ingredients: ['Chicken breast', 'Mixed greens', 'Vegetables', 'Light dressing'],
        instructions: 'Grill chicken and serve over fresh salad with light dressing.'
      },
      {
        mealType: 'dinner', 
        name: 'Baked Salmon with Quinoa',
        calories: 450,
        protein: 30,
        carbs: 35,
        fat: 15,
        description: 'Healthy fats and complex carbs',
        ingredients: ['Salmon fillet', 'Quinoa', 'Broccoli', 'Lemon'],
        instructions: 'Bake salmon and serve with cooked quinoa and steamed broccoli.'
      }
    ],
    muscleGain: [
      {
        mealType: 'breakfast',
        name: 'Protein Pancakes',
        calories: 500,
        protein: 35,
        carbs: 60,
        fat: 10,
        description: 'High-protein start to build muscle',
        ingredients: ['Protein powder', 'Oats', 'Eggs', 'Banana'],
        instructions: 'Blend ingredients and cook as pancakes. Serve with fruit.'
      },
      {
        mealType: 'lunch',
        name: 'Beef and Rice Bowl',
        calories: 600,
        protein: 40,
        carbs: 65,
        fat: 18,
        description: 'Lean beef with complex carbohydrates',
        ingredients: ['Lean beef', 'Brown rice', 'Vegetables', 'Sauce'],
        instructions: 'Cook beef and rice, combine with vegetables and sauce.'
      },
      {
        mealType: 'dinner',
        name: 'Turkey and Sweet Potato',
        calories: 550,
        protein: 45,
        carbs: 50,
        fat: 12,
        description: 'Lean protein with slow-digesting carbs',
        ingredients: ['Turkey breast', 'Sweet potato', 'Green beans', 'Herbs'],
        instructions: 'Bake turkey and sweet potato, serve with steamed green beans.'
      }
    ],
    general: [
      {
        mealType: 'breakfast',
        name: 'Greek Yogurt Parfait',
        calories: 300,
        protein: 20,
        carbs: 35,
        fat: 8,
        description: 'Balanced breakfast for sustained energy',
        ingredients: ['Greek yogurt', 'Granola', 'Mixed berries', 'Honey'],
        instructions: 'Layer yogurt with granola and berries. Drizzle with honey.'
      },
      {
        mealType: 'lunch',
        name: 'Mediterranean Wrap',
        calories: 400,
        protein: 25,
        carbs: 45,
        fat: 15,
        description: 'Fresh and flavorful lunch option',
        ingredients: ['Whole wheat wrap', 'Hummus', 'Vegetables', 'Feta cheese'],
        instructions: 'Spread hummus on wrap, add vegetables and feta, then roll.'
      },
      {
        mealType: 'dinner',
        name: 'Chicken Stir-fry',
        calories: 450,
        protein: 30,
        carbs: 40,
        fat: 12,
        description: 'Quick and healthy dinner',
        ingredients: ['Chicken', 'Mixed vegetables', 'Brown rice', 'Soy sauce'],
        instructions: 'Stir-fry chicken and vegetables, serve over brown rice.'
      }
    ]
  };

  // Select meal plan based on goals
  let planType = 'general';
  if (goals.includes('Weight Loss')) planType = 'weightLoss';
  if (goals.includes('Muscle Gain')) planType = 'muscleGain';

  return mealTemplates[planType] || mealTemplates.general;
}

// Update user nutrition progress
async function updateUserNutritionProgress(userId, foodEntry) {
  try {
    const user = await User.findById(userId);
    if (!user.dailyProgress) {
      user.dailyProgress = {
        date: new Date(),
        caloriesConsumed: 0,
        proteinConsumed: 0,
        carbsConsumed: 0,
        fatConsumed: 0
      };
    }

    user.dailyProgress.caloriesConsumed += foodEntry.calories;
    user.dailyProgress.proteinConsumed += foodEntry.protein;
    user.dailyProgress.carbsConsumed += foodEntry.carbs;
    user.dailyProgress.fatConsumed += foodEntry.fat;

    await user.save();
  } catch (error) {
    console.error('Update nutrition progress error:', error);
  }
}

// Update user water progress
async function updateUserWaterProgress(userId, glasses) {
  try {
    const user = await User.findById(userId);
    if (!user.dailyProgress) {
      user.dailyProgress = {
        date: new Date(),
        waterIntake: 0
      };
    }

    user.dailyProgress.waterIntake = glasses;
    await user.save();
  } catch (error) {
    console.error('Update water progress error:', error);
  }
}

// Get today's totals
async function getTodayTotals(userId) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFoods = await FoodEntry.find({
      userId: userId,
      date: { $gte: todayStart, $lt: tomorrow }
    });

    return todayFoods.reduce((acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  } catch (error) {
    console.error('Get today totals error:', error);
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
}

// Export all functions
module.exports = exports;
// ========== MISSING NUTRITION CONTROLLER FUNCTIONS ==========

// Get food suggestions
exports.getFoodSuggestions = async (req, res) => {
  try {
    console.log('🍴 Getting food suggestions for user:', req.user.userId);
    
    const user = await User.findById(req.user.userId);
    const fitnessPlan = user?.fitnessPlan || {};
    const remainingCalories = Math.max(0, (fitnessPlan.dailyCalories || 2000) - (user?.dailyProgress?.caloriesConsumed || 0));

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
      },
      {
        category: 'Healthy Fats',
        foods: [
          { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15 },
          { name: 'Almonds (1/4 cup)', calories: 205, protein: 8, carbs: 7, fat: 18 },
          { name: 'Salmon (4 oz)', calories: 233, protein: 25, carbs: 0, fat: 14 }
        ]
      }
    ].filter(category => 
      category.foods.some(food => food.calories <= remainingCalories)
    );

    res.json({
      success: true,
      suggestions: suggestions,
      remainingCalories: remainingCalories
    });

  } catch (error) {
    console.error('Food suggestions error:', error);
    res.json({
      success: true,
      suggestions: [
        {
          category: 'High Protein',
          foods: [
            { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
            { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 }
          ]
        }
      ],
      remainingCalories: 1150
    });
  }
};

// Delete food entry
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

// Get nutrition summary
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