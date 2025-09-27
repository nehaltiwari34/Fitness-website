import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Progress.css';

const Progress = () => {
    const { user } = useAuth();

    // Sample progress data - replace with actual API data
    const progressData = {
        weightHistory: [
            { id: 1, weight: 75.2, unit: 'kg', date: new Date().toISOString() },
            { id: 2, weight: 75.5, unit: 'kg', date: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, weight: 76.0, unit: 'kg', date: new Date(Date.now() - 172800000).toISOString() }
        ],
        foodDiary: [
            { id: 1, food: 'Protein Shake', calories: 180, mealType: 'Breakfast', date: new Date().toISOString() },
            { id: 2, food: 'Chicken Salad', calories: 350, mealType: 'Lunch', date: new Date().toISOString() }
        ],
        workoutHistory: [
            { id: 1, type: 'cardio', duration: 30, caloriesBurned: 280, date: new Date().toISOString() },
            { id: 2, type: 'strength', duration: 45, caloriesBurned: 320, date: new Date(Date.now() - 86400000).toISOString() }
        ]
    };

    // Helper functions
    const getWeightStats = () => {
        if (progressData.weightHistory.length < 2) return null;
        
        const sortedWeights = [...progressData.weightHistory].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        const firstWeight = sortedWeights[0];
        const latestWeight = sortedWeights[sortedWeights.length - 1];
        const difference = latestWeight.weight - firstWeight.weight;
        const percentageChange = ((difference / firstWeight.weight) * 100).toFixed(1);
        
        return {
            difference: Math.abs(difference),
            isGain: difference > 0,
            percentageChange: Math.abs(percentageChange)
        };
    };

    const getRecentWorkouts = (days = 7) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return progressData.workoutHistory.filter(workout => 
            new Date(workout.date) >= cutoffDate
        );
    };

    const getTodayCalories = () => {
        const today = new Date().toDateString();
        return progressData.foodDiary
            .filter(food => new Date(food.date).toDateString() === today)
            .reduce((sum, food) => sum + food.calories, 0);
    };

    const getTodayFoods = () => {
        const today = new Date().toDateString();
        return progressData.foodDiary.filter(food => 
            new Date(food.date).toDateString() === today
        );
    };

    const weightStats = getWeightStats();
    const recentWorkouts = getRecentWorkouts(7);
    const todayCalories = getTodayCalories();
    const todayFoods = getTodayFoods();
    const weeklyCaloriesAverage = Math.round(todayCalories * 0.85); // Simplified calculation

    const workoutFrequency = () => {
        if (recentWorkouts.length === 0) return 'No workouts yet';
        if (recentWorkouts.length >= 5) return 'Very Active (5+ workouts/week)';
        if (recentWorkouts.length >= 3) return 'Active (3-4 workouts/week)';
        if (recentWorkouts.length >= 1) return 'Moderate (1-2 workouts/week)';
        return 'Light (Less than 1 workout/week)';
    };

    const getLatestWeight = () => {
        if (progressData.weightHistory.length === 0) return null;
        const sortedWeights = [...progressData.weightHistory].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        return sortedWeights[0];
    };

    const latestWeight = getLatestWeight();

    if (!user) {
        return (
            <div className="progress-container">
                <div className="auth-required">
                    <h2>Please log in to view your progress</h2>
                    <p>Track your fitness journey with detailed analytics</p>
                    <div className="auth-actions">
                        <Link to="/login" className="btn-primary">Login</Link>
                        <Link to="/signup" className="btn-outline">Sign Up</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="progress-container">
            <div className="progress-header">
                <h1>Your Progress & Analytics</h1>
                <p>Track your fitness journey with detailed insights and trends</p>
            </div>

            {/* Quick Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon">⚖️</div>
                    <div className="stat-content">
                        <h3>Weight Entries</h3>
                        <span className="stat-number">{progressData.weightHistory.length}</span>
                        <span className="stat-label">Total tracked</span>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">🍎</div>
                    <div className="stat-content">
                        <h3>Meals Logged</h3>
                        <span className="stat-number">{progressData.foodDiary.length}</span>
                        <span className="stat-label">All time</span>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">💪</div>
                    <div className="stat-content">
                        <h3>Total Workouts</h3>
                        <span className="stat-number">{progressData.workoutHistory.length}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-content">
                        <h3>Avg Calories</h3>
                        <span className="stat-number">{weeklyCaloriesAverage}</span>
                        <span className="stat-label">Per day (7d)</span>
                    </div>
                </div>
            </div>

            {/* Weight Progress Section */}
            <div className="progress-section">
                <div className="section-header">
                    <h2>Weight Progress</h2>
                    <Link to="/nutrition" className="btn-outline">Log Weight</Link>
                </div>
                
                {progressData.weightHistory.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">⚖️</div>
                        <h3>No weight data yet</h3>
                        <p>Start tracking your weight to see progress charts and insights.</p>
                        <Link to="/nutrition" className="btn-primary">Log Your First Weight</Link>
                    </div>
                ) : (
                    <div className="weight-progress-content">
                        <div className="weight-stats">
                            <div className="weight-stat">
                                <span className="stat-value">
                                    {latestWeight ? `${latestWeight.weight} ${latestWeight.unit}` : 'No data'}
                                </span>
                                <span className="stat-label">Current Weight</span>
                            </div>
                            
                            {weightStats && (
                                <>
                                    <div className="weight-stat">
                                        <span className={`stat-value ${weightStats.isGain ? 'negative' : 'positive'}`}>
                                            {weightStats.isGain ? '+' : '-'}{weightStats.difference.toFixed(1)} {latestWeight?.unit}
                                        </span>
                                        <span className="stat-label">Total Change</span>
                                    </div>
                                    
                                    <div className="weight-stat">
                                        <span className="stat-value">{weightStats.percentageChange}%</span>
                                        <span className="stat-label">Overall Change</span>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="weight-history">
                            <h4>Recent Weight Entries</h4>
                            {progressData.weightHistory.slice(-5).reverse().map(entry => (
                                <div key={entry.id} className="weight-entry">
                                    <div className="weight-value">{entry.weight} {entry.unit}</div>
                                    <div className="weight-date">
                                        {new Date(entry.date).toLocaleDateString()}
                                    </div>
                                    <div className="weight-time">
                                        {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Workout History Section */}
            <div className="progress-section">
                <div className="section-header">
                    <h2>Workout Activity</h2>
                    <div className="workout-summary">
                        <span className="frequency-badge">{workoutFrequency()}</span>
                        <Link to="/workouts" className="btn-outline">Log Workout</Link>
                    </div>
                </div>
                
                {progressData.workoutHistory.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💪</div>
                        <h3>No workouts logged yet</h3>
                        <p>Start logging your workouts to track your fitness progress and consistency.</p>
                        <Link to="/workouts" className="btn-primary">Log Your First Workout</Link>
                    </div>
                ) : (
                    <div className="workout-content">
                        <div className="workout-stats">
                            <div className="workout-stat">
                                <span className="stat-value">{recentWorkouts.length}</span>
                                <span className="stat-label">This Week</span>
                            </div>
                            <div className="workout-stat">
                                <span className="stat-value">
                                    {Math.round(progressData.workoutHistory.reduce((sum, w) => sum + w.duration, 0) / progressData.workoutHistory.length)} min
                                </span>
                                <span className="stat-label">Avg Duration</span>
                            </div>
                            <div className="workout-stat">
                                <span className="stat-value">
                                    {progressData.workoutHistory.reduce((sum, w) => sum + w.caloriesBurned, 0)}
                                </span>
                                <span className="stat-label">Total Calories</span>
                            </div>
                        </div>
                        
                        <div className="workout-history">
                            <h4>Recent Workouts (Last 7 Days)</h4>
                            {recentWorkouts.slice(-10).reverse().map(workout => (
                                <div key={workout.id} className="workout-entry">
                                    <div className={`workout-type-badge ${workout.type}`}>
                                        {workout.type}
                                    </div>
                                    <div className="workout-details">
                                        <h4>{workout.type} Workout</h4>
                                        <div className="workout-meta">
                                            <span>⏱️ {workout.duration} minutes</span>
                                            <span>🔥 {workout.caloriesBurned} kcal</span>
                                        </div>
                                    </div>
                                    <div className="workout-date">
                                        {new Date(workout.date).toLocaleDateString()}
                                        <br />
                                        <small>{new Date(workout.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions Footer */}
            <div className="progress-actions">
                <h3>Need to log something?</h3>
                <div className="action-buttons">
                    <Link to="/nutrition" className="action-btn weight-btn">
                        <span>⚖️</span>
                        Log Weight
                    </Link>
                    <Link to="/nutrition" className="action-btn food-btn">
                        <span>🍎</span>
                        Log Food
                    </Link>
                    <Link to="/workouts" className="action-btn workout-btn">
                        <span>💪</span>
                        Log Workout
                    </Link>
                    <Link to="/dashboard" className="action-btn dashboard-btn">
                        <span>📊</span>
                        View Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Progress;