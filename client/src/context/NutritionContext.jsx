// src/context/NutritionContext.jsx - REAL API CALLS VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

const NutritionContext = createContext();

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};

export const NutritionProvider = ({ children }) => {
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch nutrition data from real API
  useEffect(() => {
    if (user) {
      fetchNutritionData();
    }
  }, [user]);

  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🍎 Fetching nutrition data from API...');
      
      // Make real API call to get today's nutrition data
      const response = await api.get('/nutrition/today');
      
      if (response.data.success) {
        setNutritionData(response.data);
        console.log('✅ Nutrition data loaded successfully from API');
      } else {
        throw new Error('Failed to fetch nutrition data');
      }
      
    } catch (err) {
      console.error('❌ Nutrition API error:', err);
      setError('Failed to load nutrition data. Using demo data.');
      // Fallback to demo data if API fails
      setNutritionData(getFallbackNutritionData());
    } finally {
      setLoading(false);
    }
  };

  const logFood = async (foodData) => {
    try {
      console.log('📝 Logging food via API:', foodData);
      
      // Make real API call to log food
      const response = await api.post('/nutrition/log-food', foodData);
      
      if (response.data.success) {
        // Refresh data after logging food
        await fetchNutritionData();
        return { 
          success: true, 
          message: response.data.message || 'Food logged successfully! 🎉' 
        };
      } else {
        throw new Error(response.data.message || 'Failed to log food');
      }
    } catch (error) {
      console.error('Log food API error:', error);
      return { 
        success: false, 
        message: 'Failed to log food. Please try again.' 
      };
    }
  };

  const addWater = async (glasses = 1) => {
    try {
      console.log('💧 Adding water via API:', glasses, 'glasses');
      
      // Make real API call to log water
      const response = await api.post('/nutrition/log-water', { glasses });
      
      if (response.data.success) {
        // Refresh data after adding water
        await fetchNutritionData();
        return { 
          success: true, 
          message: response.data.message || `+${glasses} glass of water added! 💦` 
        };
      } else {
        throw new Error(response.data.message || 'Failed to add water');
      }
    } catch (error) {
      console.error('Add water API error:', error);
      return { 
        success: false, 
        message: 'Failed to add water. Please try again.' 
      };
    }
  };

  const generateMealPlan = async () => {
    try {
      console.log('🍽️ Generating meal plan via API');
      
      const response = await api.post('/nutrition/generate-plan');
      
      if (response.data.success) {
        return { 
          success: true, 
          mealPlan: response.data.mealPlan,
          message: response.data.message 
        };
      } else {
        throw new Error(response.data.message || 'Failed to generate meal plan');
      }
    } catch (error) {
      console.error('Generate meal plan API error:', error);
      return { 
        success: false, 
        message: 'Failed to generate meal plan. Please try again.' 
      };
    }
  };

  const getNutritionHistory = async () => {
    try {
      console.log('📈 Fetching nutrition history via API');
      
      const response = await api.get('/nutrition/history');
      
      if (response.data.success) {
        return { 
          success: true, 
          history: response.data.history 
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch nutrition history');
      }
    } catch (error) {
      console.error('Nutrition history API error:', error);
      return { 
        success: false, 
        message: 'Failed to fetch nutrition history.',
        history: [] 
      };
    }
  };

  // Fallback data in case API fails
  const getFallbackNutritionData = () => {
    return {
      success: true,
      foods: [
        { 
          id: 1,
          foodName: 'Oatmeal with Berries', 
          calories: 350, 
          protein: 12, 
          carbs: 60, 
          fat: 5, 
          mealType: 'breakfast',
          time: '08:30 AM'
        },
        { 
          id: 2,
          foodName: 'Grilled Chicken Salad', 
          calories: 400, 
          protein: 35, 
          carbs: 20, 
          fat: 15, 
          mealType: 'lunch',
          time: '01:15 PM'
        },
        { 
          id: 3,
          foodName: 'Greek Yogurt', 
          calories: 100, 
          protein: 18, 
          carbs: 6, 
          fat: 0, 
          mealType: 'snack',
          time: '04:00 PM'
        }
      ],
      waterIntake: 3,
      totals: { 
        calories: 850, 
        protein: 65, 
        carbs: 86, 
        fat: 20 
      },
      goals: { 
        dailyCalories: 2000, 
        proteinGoal: 150, 
        carbsGoal: 250, 
        fatGoal: 70 
      },
      remainingCalories: 1150
    };
  };

  const clearError = () => {
    setError(null);
  };

  const refreshData = () => {
    fetchNutritionData();
  };

  const value = {
    nutritionData,
    loading,
    error,
    fetchNutritionData,
    logFood,
    addWater,
    generateMealPlan,
    getNutritionHistory,
    refreshData,
    clearError
  };

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
};