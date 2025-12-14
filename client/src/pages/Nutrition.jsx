import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNutrition } from '../context/NutritionContext';
import { api } from '../utils/api';
import '../css/Nutrition.css';

const Nutrition = () => {
  const { user } = useAuth();
  const { logFood, addWater } = useNutrition();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayLogs, setTodayLogs] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyProgress, setDailyProgress] = useState({});
  const [fitnessPlan, setFitnessPlan] = useState({});
  const [mealPlan, setMealPlan] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState([]);

  // Fetch today's dashboard data
  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      console.log('🍎 Fetching nutrition data from API...');
      const res = await api.get('/nutrition/today');
      
      if (res.data.success) {
        console.log('✅ Nutrition API response:', res.data);
        setTodayLogs(res.data.foods || []);
        setWaterIntake(res.data.waterIntake || 0);
        setDailyProgress(res.data.totals || {});
        setFitnessPlan(res.data.goals || {});
      } else {
        throw new Error(res.data.message || 'Failed to fetch nutrition data');
      }
    } catch (e) {
      console.error('❌ Nutrition API error:', e);
      setError('Failed to load nutrition data from server.');
      // Set fallback data
      setTodayLogs([
        { foodName: 'Oatmeal with Berries', calories: 350, protein: 12, carbs: 60, fat: 5, mealType: 'breakfast' },
        { foodName: 'Grilled Chicken Salad', calories: 400, protein: 35, carbs: 20, fat: 15, mealType: 'lunch' }
      ]);
      setWaterIntake(3);
      setDailyProgress({ calories: 750, protein: 47, carbs: 80, fat: 20 });
      setFitnessPlan({ dailyCalories: 2000, proteinGoal: 150, carbsGoal: 250, fatGoal: 70 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch meal plan
  const fetchMealPlan = useCallback(async () => {
    try {
      const res = await api.get('/nutrition/generate-plan');
      if (res.data.success) {
        setMealPlan(res.data.mealPlan || null);
      }
    } catch {
      setMealPlan(null);
    }
  }, []);

  // Fetch last 7 days
  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get('/nutrition/history');
      if (res.data.success) {
        setWeeklyProgress(res.data.history || []);
      }
    } catch {
      setWeeklyProgress([]);
    }
  }, []);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user, fetchDashboard]);

  useEffect(() => {
    if (activeTab === "meal-plan") fetchMealPlan();
    if (activeTab === "progress") fetchHistory();
    // eslint-disable-next-line
  }, [activeTab]);

  const handleAddWater = async () => {
    try {
      const res = await addWater(1);
      if (res.success) {
        setWaterIntake(prev => prev + 1);
        fetchDashboard();
      }
    } catch { 
      alert('Error logging water.'); 
    }
  };

  const handleLogFood = async (foodData) => {
    try {
      const result = await logFood(foodData);
      if (result.success) {
        fetchDashboard();
        return true;
      }
      return false;
    } catch {
      alert('Failed to log food');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="nutrition-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your nutrition data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nutrition-container">
        <div className="error-banner">
          {error}
          <button className="retry-btn" onClick={fetchDashboard}>Retry</button>
        </div>
      </div>
    );
  }

  const remainingCalories = (fitnessPlan.dailyCalories || 2000) - (dailyProgress.calories || 0);

  return (
    <div className="nutrition-container">
      <div className="nutrition-header">
        <h1>Nutrition Dashboard</h1>
        <p>Track your meals and stay on target with your goals</p>
      </div>
      <div className="nutrition-nav">
        <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        <button className={`nav-btn ${activeTab === 'meal-plan' ? 'active' : ''}`} onClick={() => setActiveTab('meal-plan')}>🍽️ Meal Plan</button>
        <button className={`nav-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>📈 Progress</button>
        <button className={`nav-btn ${activeTab === 'log-food' ? 'active' : ''}`} onClick={() => setActiveTab('log-food')}>➕ Log Food</button>
      </div>
      {activeTab === 'dashboard' && (
        <DashboardTab dailyProgress={dailyProgress} fitnessPlan={fitnessPlan} todayLogs={todayLogs} waterIntake={waterIntake} onAddWater={handleAddWater} remainingCalories={remainingCalories} />
      )}
      {activeTab === 'meal-plan' && (
        <MealPlanTab mealPlan={mealPlan} fetchMealPlan={fetchMealPlan} />
      )}
      {activeTab === 'progress' && (
        <ProgressTab weeklyProgress={weeklyProgress} fitnessPlan={fitnessPlan} />
      )}
      {activeTab === 'log-food' && (
        <LogFoodTab onLogFood={handleLogFood} remainingCalories={remainingCalories} />
      )}
    </div>
  );
};

// Dashboard Tab
const DashboardTab = ({ dailyProgress, fitnessPlan, todayLogs, waterIntake, onAddWater, remainingCalories }) => {
  const caloriesProgress = Math.min(100, ((dailyProgress?.calories || 0) / (fitnessPlan?.dailyCalories || 2000)) * 100);
  const proteinProgress = Math.min(100, ((dailyProgress?.protein || 0) / (fitnessPlan?.proteinGoal || 100)) * 100);
  const waterProgress = Math.min(100, (waterIntake / 8) * 100);

  return (
    <div className="dashboard-tab">
      <div className="nutrition-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{dailyProgress?.calories || 0}</h3>
            <p>Calories Consumed</p>
            <div className="stat-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${caloriesProgress}%` }}></div>
              </div>
              <span>{Math.round(caloriesProgress)}%</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <h3>{dailyProgress?.protein || 0}g</h3>
            <p>Protein</p>
            <div className="stat-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${proteinProgress}%` }}></div>
              </div>
              <span>{Math.round(proteinProgress)}%</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💧</div>
          <div className="stat-content">
            <h3>{waterIntake}</h3>
            <p>Water Glasses</p>
            <div className="stat-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${waterProgress}%` }}></div>
              </div>
              <span>{Math.round(waterProgress)}%</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{remainingCalories}</h3>
            <p>Calories Remaining</p>
            <span className="stat-subtext">{remainingCalories > 0 ? 'On track' : 'Over budget'}</span>
          </div>
        </div>
      </div>
      <div className="today-food-section">
        <div className="section-header">
          <h2>Today's Food Log</h2>
          <span className="date-badge">{new Date().toLocaleDateString()}</span>
        </div>
        {todayLogs.length > 0 ? (
          <div className="food-log">
            {todayLogs.map((food, idx) => (
              <div key={idx} className="food-item">
                <div className="food-info">
                  <h4>{food.foodName}</h4>
                  <div className="food-macros">
                    <span>🔥 {food.calories} cal</span>
                    <span>💪 {food.protein}g protein</span>
                    <span>🌾 {food.carbs}g carbs</span>
                    <span>🥑 {food.fat}g fat</span>
                  </div>
                </div>
                <div className="food-time">{food.mealType || 'Snack'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-food-log">
            <div className="no-food-icon">🍽️</div>
            <h3>No Food Logged Today</h3>
            <p>Start tracking your meals to see your progress</p>
          </div>
        )}
      </div>
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="action-card visible-btn" onClick={onAddWater}>
            <div className="action-icon">💧</div>
            <h3>ADD WATER</h3>
            <p>+1 glass</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Meal Plan Tab
const MealPlanTab = ({ mealPlan, fetchMealPlan }) => (
  <div className="meal-plan-tab">
    {!mealPlan ? (
      <div className="no-meal-plan">
        <div className="no-plan-icon">🍽️</div>
        <h3>No Meal Plan Generated</h3>
        <button onClick={fetchMealPlan} className="btn-primary">Generate Meal Plan</button>
      </div>
    ) : (
      <div>
        <h3>Your Meal Plan</h3>
        {mealPlan.meals && mealPlan.meals.length > 0 ? mealPlan.meals.map((meal, idx) => (
          <div className="meal-item" key={idx}>
            <h4>{meal.mealType}: {meal.name}</h4>
            <div>{meal.description}</div>
            <ul>
              {meal.ingredients && meal.ingredients.map((ing, i) => (<li key={i}>{ing}</li>))}
            </ul>
          </div>
        )) : <div>No meals generated yet.</div>}
      </div>
    )}
  </div>
);

// Progress Tab + Weekly Calculation
const ProgressTab = ({ weeklyProgress, fitnessPlan }) => {
  const weekData = calculateWeeklyProgress(weeklyProgress, fitnessPlan);
  return (
    <div className="progress-tab">
      <h2>Weekly Progress</h2>
      {weekData.length === 0 ? <p>No data yet.</p> :
        weekData.map((day, idx) => (
          <div key={idx} className="progress-history-item">
            <b>{day.date}:</b> {day.calories} cal / {day.caloriesGoal}, {day.protein}g / {day.proteinGoal}
          </div>
        ))
      }
    </div>
  );
};

// Helper for ProgressTab
function calculateWeeklyProgress(weekArr, fitnessPlan) {
  return weekArr.map(day => ({
    date: (day.date ? new Date(day.date).toLocaleDateString() : ''),
    calories: day.calories ?? 0,
    protein: day.protein ?? 0,
    caloriesGoal: fitnessPlan.dailyCalories || 2000,
    proteinGoal: fitnessPlan.proteinGoal || 100,
  }));
}

// Log Food Tab
const LogFoodTab = ({ onLogFood, remainingCalories }) => {
  const [form, setForm] = useState({ foodName: '', calories: '', protein: '', carbs: '', fat: '', mealType: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onLogFood({
      ...form,
      calories: parseInt(form.calories) || 0,
      protein: parseInt(form.protein) || 0,
      carbs: parseInt(form.carbs) || 0,
      fat: parseInt(form.fat) || 0
    });
    if (ok) setForm({ foodName: '', calories: '', protein: '', carbs: '', fat: '', mealType: '' });
    setSaving(false);
  };

  return (
    <div className="log-food-tab">
      <div className="section-header">
        <h2>Log Food</h2>
        <span className="calories-remaining">{remainingCalories} calories remaining</span>
      </div>
      <form onSubmit={handleSubmit} className="food-form">
        <input type="text" placeholder="Food Name" value={form.foodName} required onChange={e => setForm({ ...form, foodName: e.target.value })} />
        <input type="number" placeholder="Calories" value={form.calories} required onChange={e => setForm({ ...form, calories: e.target.value })} />
        <input type="number" placeholder="Protein (g)" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} />
        <input type="number" placeholder="Carbs (g)" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} />
        <input type="number" placeholder="Fat (g)" value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} />
        <select value={form.mealType} onChange={e => setForm({ ...form, mealType: e.target.value })}>
          <option value="">Meal Type</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snack">Snack</option>
        </select>
        <button type="submit" disabled={saving}>{saving ? 'Logging...' : 'Log Food'}</button>
      </form>
    </div>
  );
};

export default Nutrition;
