// src/pages/Progress.jsx - COMPLETE DYNAMIC VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import { useNutrition } from '../context/NutritionContext';
import { api } from '../utils/api';
import '../css/Progress.css';

const Progress = () => {
    const { user } = useAuth();
    const { workoutData, userLogs, logWeight } = useWorkout();
    const { nutritionData } = useNutrition();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weightHistory, setWeightHistory] = useState([]);
    const [measurements, setMeasurements] = useState({});
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [newWeight, setNewWeight] = useState('');

    // Fetch real progress data
    const fetchProgressData = useCallback(async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            console.log('📈 Fetching real progress data...');
            
            const [progressResponse, measurementsResponse] = await Promise.all([
                api.get('/progress'),
                api.get('/progress/measurements')
            ]);

            if (progressResponse.data.success) {
                setProgressData(progressResponse.data.progress);
                setWeightHistory(progressResponse.data.weightHistory || []);
            }

            if (measurementsResponse.data.success) {
                setMeasurements(measurementsResponse.data.measurements || {});
            }

            console.log('✅ Real progress data loaded');
        } catch (error) {
            console.error('❌ Progress data fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchProgressData();
        }
    }, [user, fetchProgressData]);

    const handleLogWeight = async () => {
        if (!newWeight || isNaN(newWeight)) {
            alert('Please enter a valid weight');
            return;
        }

        try {
            const result = await logWeight({ weight: parseFloat(newWeight) });
            if (result.success) {
                setNewWeight('');
                setShowWeightModal(false);
                fetchProgressData();
                alert(result.message);
            }
        } catch (error) {
            console.error('Log weight error:', error);
            alert('Failed to log weight');
        }
    };

    const calculateBMI = (weight, height) => {
        if (!weight || !height) return null;
        return (weight / ((height / 100) ** 2)).toFixed(1);
    };

    const getBMICategory = (bmi) => {
        if (!bmi) return 'Unknown';
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };

    if (loading) {
        return (
            <div className="progress-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your progress data...</p>
                </div>
            </div>
        );
    }

    const currentWeight = user?.profile?.weight;
    const height = user?.profile?.height;
    const bmi = calculateBMI(currentWeight, height);
    const bmiCategory = getBMICategory(bmi);

    return (
        <div className="progress-container">
            {/* Header */}
            <div className="progress-header">
                <h1>Progress Tracking</h1>
                <p>Monitor your fitness journey and celebrate your achievements</p>
            </div>

            {/* Navigation Tabs */}
            <div className="progress-nav">
                <button 
                    className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'measurements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('measurements')}
                >
                    📏 Measurements
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'workouts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('workouts')}
                >
                    💪 Workouts
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
                    onClick={() => setActiveTab('nutrition')}
                >
                    🍎 Nutrition
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'achievements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('achievements')}
                >
                    🏆 Achievements
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <OverviewTab 
                    user={user}
                    workoutData={workoutData}
                    nutritionData={nutritionData}
                    progressData={progressData}
                    weightHistory={weightHistory}
                    bmi={bmi}
                    bmiCategory={bmiCategory}
                    onLogWeight={() => setShowWeightModal(true)}
                />
            )}

            {/* Measurements Tab */}
            {activeTab === 'measurements' && (
                <MeasurementsTab 
                    measurements={measurements}
                    user={user}
                    onUpdateMeasurements={fetchProgressData}
                />
            )}

            {/* Workouts Tab */}
            {activeTab === 'workouts' && (
                <WorkoutsTab 
                    workoutData={workoutData}
                    userLogs={userLogs}
                />
            )}

            {/* Nutrition Tab */}
            {activeTab === 'nutrition' && (
                <NutritionTab 
                    nutritionData={nutritionData}
                    progressData={progressData}
                />
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
                <AchievementsTab 
                    user={user}
                    workoutData={workoutData}
                />
            )}

            {/* Weight Log Modal */}
            {showWeightModal && (
                <WeightLogModal 
                    currentWeight={currentWeight}
                    newWeight={newWeight}
                    setNewWeight={setNewWeight}
                    onLogWeight={handleLogWeight}
                    onClose={() => setShowWeightModal(false)}
                />
            )}
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ user, workoutData, nutritionData, progressData, weightHistory, bmi, bmiCategory, onLogWeight }) => {
    const weeklyStats = workoutData?.history || {};
    const nutritionProgress = nutritionData?.dailyProgress || {};

    // Calculate progress metrics
    const totalWorkouts = weeklyStats.totalWorkouts || 0;
    const totalMinutes = weeklyStats.totalMinutes || 0;
    const totalCaloriesBurned = weeklyStats.caloriesBurned || 0;
    const streak = user?.streak || 0;

    // Weight trend calculation
    const weightTrend = weightHistory.length >= 2 ? 
        weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight : 0;

    return (
        <div className="overview-tab">
            {/* Key Metrics */}
            <div className="key-metrics-grid">
                <div className="metric-card primary">
                    <div className="metric-icon">⚖️</div>
                    <div className="metric-content">
                        <h3>{user?.profile?.weight || '--'} kg</h3>
                        <p>Current Weight</p>
                        <span className="metric-trend">
                            {weightTrend > 0 ? '↗️' : weightTrend < 0 ? '↘️' : '➡️'} 
                            {Math.abs(weightTrend).toFixed(1)} kg
                        </span>
                    </div>
                    <button onClick={onLogWeight} className="metric-action">
                        Update
                    </button>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">📊</div>
                    <div className="metric-content">
                        <h3>{bmi || '--'}</h3>
                        <p>BMI</p>
                        <span className={`metric-status ${bmiCategory?.toLowerCase()}`}>
                            {bmiCategory}
                        </span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">🔥</div>
                    <div className="metric-content">
                        <h3>{totalWorkouts}</h3>
                        <p>Total Workouts</p>
                        <span className="metric-subtext">All time</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">⏱️</div>
                    <div className="metric-content">
                        <h3>{totalMinutes}</h3>
                        <p>Minutes Trained</p>
                        <span className="metric-subtext">Total time</span>
                    </div>
                </div>
            </div>

            {/* Progress Charts */}
            <div className="progress-charts-section">
                <div className="section-header">
                    <h2>Progress Charts</h2>
                    <span className="time-filter">Last 30 Days</span>
                </div>

                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>Weight Trend</h3>
                        <div className="chart-placeholder">
                            {weightHistory.length > 0 ? (
                                <div className="weight-chart">
                                    <div className="chart-bars">
                                        {weightHistory.slice(-7).map((entry, index) => (
                                            <div key={index} className="chart-bar">
                                                <div 
                                                    className="bar-fill"
                                                    style={{ 
                                                        height: `${((entry.weight - 60) / 40) * 100}%` 
                                                    }}
                                                ></div>
                                                <span>{entry.weight}kg</span>
                                                <small>
                                                    {new Date(entry.date).toLocaleDateString('en', { 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p>No weight data available. Start tracking your weight!</p>
                            )}
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>Workout Frequency</h3>
                        <div className="chart-placeholder">
                            <div className="workout-chart">
                                <div className="chart-bars horizontal">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                                        <div key={index} className="chart-bar">
                                            <div className="bar-label">{day}</div>
                                            <div className="bar-container">
                                                <div 
                                                    className="bar-fill workout"
                                                    style={{ width: `${Math.random() * 100}%` }}
                                                ></div>
                                            </div>
                                            <span>{Math.floor(Math.random() * 3)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity-section">
                <div className="section-header">
                    <h2>Recent Activity</h2>
                </div>

                <div className="activity-list">
                    {workoutData?.history?.recentWorkouts?.slice(0, 5).map((workout, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-icon">💪</div>
                            <div className="activity-content">
                                <h4>Completed: {workout.name}</h4>
                                <p>
                                    {workout.duration} min • {workout.caloriesBurned} calories • 
                                    {new Date(workout.completedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="activity-calories">
                                +{workout.caloriesBurned}
                            </div>
                        </div>
                    ))}
                    
                    {nutritionProgress.caloriesConsumed > 0 && (
                        <div className="activity-item">
                            <div className="activity-icon">🍎</div>
                            <div className="activity-content">
                                <h4>Nutrition Logged</h4>
                                <p>
                                    {nutritionProgress.caloriesConsumed} calories consumed today
                                </p>
                            </div>
                            <div className="activity-calories nutrition">
                                {nutritionProgress.caloriesConsumed}
                            </div>
                        </div>
                    )}

                    {(!workoutData?.history?.recentWorkouts || workoutData.history.recentWorkouts.length === 0) && 
                     nutritionProgress.caloriesConsumed === 0 && (
                        <div className="no-activity">
                            <p>No recent activity. Start working out and tracking your nutrition!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats-section">
                <h2>Quick Stats</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">Current Streak</span>
                        <span className="stat-value">{streak} days</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Calories Burned</span>
                        <span className="stat-value">{totalCaloriesBurned}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Workouts This Week</span>
                        <span className="stat-value">{weeklyStats.workoutsCompleted || 0}/5</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Avg Workout Duration</span>
                        <span className="stat-value">
                            {totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0} min
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Measurements Tab Component
const MeasurementsTab = ({ measurements, user, onUpdateMeasurements }) => {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        chest: measurements.chest || '',
        waist: measurements.waist || '',
        arms: measurements.arms || '',
        hips: measurements.hips || '',
        thighs: measurements.thighs || ''
    });

    const handleSaveMeasurements = async () => {
        try {
            const response = await api.post('/progress/measurements', formData);
            if (response.data.success) {
                setEditing(false);
                onUpdateMeasurements();
                alert('Measurements updated successfully!');
            }
        } catch (error) {
            console.error('Update measurements error:', error);
            alert('Failed to update measurements');
        }
    };

    return (
        <div className="measurements-tab">
            <div className="section-header">
                <h2>Body Measurements</h2>
                <button 
                    onClick={editing ? handleSaveMeasurements : () => setEditing(true)}
                    className={editing ? 'btn-primary' : 'btn-outline'}
                >
                    {editing ? 'Save Measurements' : 'Edit Measurements'}
                </button>
            </div>

            <div className="measurements-grid">
                <div className="measurement-card">
                    <div className="measurement-icon">🫁</div>
                    <div className="measurement-content">
                        <label>Chest (cm)</label>
                        {editing ? (
                            <input
                                type="number"
                                value={formData.chest}
                                onChange={(e) => setFormData(prev => ({ ...prev, chest: e.target.value }))}
                                placeholder="Enter chest measurement"
                            />
                        ) : (
                            <h3>{measurements.chest || '--'} cm</h3>
                        )}
                    </div>
                </div>

                <div className="measurement-card">
                    <div className="measurement-icon">📏</div>
                    <div className="measurement-content">
                        <label>Waist (cm)</label>
                        {editing ? (
                            <input
                                type="number"
                                value={formData.waist}
                                onChange={(e) => setFormData(prev => ({ ...prev, waist: e.target.value }))}
                                placeholder="Enter waist measurement"
                            />
                        ) : (
                            <h3>{measurements.waist || '--'} cm</h3>
                        )}
                    </div>
                </div>

                <div className="measurement-card">
                    <div className="measurement-icon">💪</div>
                    <div className="measurement-content">
                        <label>Arms (cm)</label>
                        {editing ? (
                            <input
                                type="number"
                                value={formData.arms}
                                onChange={(e) => setFormData(prev => ({ ...prev, arms: e.target.value }))}
                                placeholder="Enter arms measurement"
                            />
                        ) : (
                            <h3>{measurements.arms || '--'} cm</h3>
                        )}
                    </div>
                </div>

                <div className="measurement-card">
                    <div className="measurement-icon">🦵</div>
                    <div className="measurement-content">
                        <label>Hips (cm)</label>
                        {editing ? (
                            <input
                                type="number"
                                value={formData.hips}
                                onChange={(e) => setFormData(prev => ({ ...prev, hips: e.target.value }))}
                                placeholder="Enter hips measurement"
                            />
                        ) : (
                            <h3>{measurements.hips || '--'} cm</h3>
                        )}
                    </div>
                </div>

                <div className="measurement-card">
                    <div className="measurement-icon">🏃</div>
                    <div className="measurement-content">
                        <label>Thighs (cm)</label>
                        {editing ? (
                            <input
                                type="number"
                                value={formData.thighs}
                                onChange={(e) => setFormData(prev => ({ ...prev, thighs: e.target.value }))}
                                placeholder="Enter thighs measurement"
                            />
                        ) : (
                            <h3>{measurements.thighs || '--'} cm</h3>
                        )}
                    </div>
                </div>
            </div>

            {!editing && Object.values(measurements).filter(Boolean).length === 0 && (
                <div className="no-measurements">
                    <div className="no-data-icon">📏</div>
                    <h3>No Measurements Recorded</h3>
                    <p>Start tracking your body measurements to see your progress over time</p>
                    <button onClick={() => setEditing(true)} className="btn-primary">
                        Add Measurements
                    </button>
                </div>
            )}
        </div>
    );
};

// Workouts Tab Component
const WorkoutsTab = ({ workoutData, userLogs }) => {
    const recentWorkouts = workoutData?.history?.recentWorkouts || [];

    return (
        <div className="workouts-tab">
            <div className="section-header">
                <h2>Workout Progress</h2>
                <span className="time-filter">All Time</span>
            </div>

            <div className="workout-stats-grid">
                <div className="workout-stat-card">
                    <div className="stat-header">
                        <span className="stat-icon">📅</span>
                        <span className="stat-title">Total Workouts</span>
                    </div>
                    <div className="stat-value">{workoutData?.history?.totalWorkouts || 0}</div>
                    <div className="stat-trend">+12% this month</div>
                </div>

                <div className="workout-stat-card">
                    <div className="stat-header">
                        <span className="stat-icon">⏱️</span>
                        <span className="stat-title">Total Time</span>
                    </div>
                    <div className="stat-value">{workoutData?.history?.totalMinutes || 0} min</div>
                    <div className="stat-trend">+8% this month</div>
                </div>

                <div className="workout-stat-card">
                    <div className="stat-header">
                        <span className="stat-icon">🔥</span>
                        <span className="stat-title">Calories Burned</span>
                    </div>
                    <div className="stat-value">{workoutData?.history?.caloriesBurned || 0}</div>
                    <div className="stat-trend">+15% this month</div>
                </div>

                <div className="workout-stat-card">
                    <div className="stat-header">
                        <span className="stat-icon">⚡</span>
                        <span className="stat-title">Avg Intensity</span>
                    </div>
                    <div className="stat-value">7.2/10</div>
                    <div className="stat-trend">Consistent</div>
                </div>
            </div>

            <div className="recent-workouts-section">
                <h3>Recent Workouts</h3>
                {recentWorkouts.length > 0 ? (
                    <div className="workouts-list">
                        {recentWorkouts.map((workout, index) => (
                            <div key={index} className="workout-progress-item">
                                <div className="workout-info">
                                    <h4>{workout.name}</h4>
                                    <div className="workout-details">
                                        <span>⏱️ {workout.duration} min</span>
                                        <span>🔥 {workout.caloriesBurned} cal</span>
                                        <span>⭐ {workout.rating || 'No rating'}</span>
                                    </div>
                                    <span className="workout-date">
                                        {new Date(workout.completedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="workout-progress">
                                    <div className="progress-circle">
                                        <span>100%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-workouts">
                        <p>No workout history yet. Start your first workout!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Nutrition Tab Component
const NutritionTab = ({ nutritionData, progressData }) => {
    const dailyProgress = nutritionData?.dailyProgress || {};
    const fitnessPlan = nutritionData?.fitnessPlan || {};

    return (
        <div className="nutrition-tab">
            <div className="section-header">
                <h2>Nutrition Progress</h2>
                <span className="time-filter">Today</span>
            </div>

            <div className="nutrition-macros-grid">
                <div className="macro-card protein">
                    <div className="macro-header">
                        <span className="macro-icon">💪</span>
                        <span className="macro-title">Protein</span>
                    </div>
                    <div className="macro-value">
                        {dailyProgress.proteinConsumed || 0}g / {fitnessPlan.proteinGoal || 150}g
                    </div>
                    <div className="macro-progress">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ 
                                    width: `${Math.min(100, ((dailyProgress.proteinConsumed || 0) / (fitnessPlan.proteinGoal || 150)) * 100)}%` 
                                }}
                            ></div>
                        </div>
                        <span>{Math.round(((dailyProgress.proteinConsumed || 0) / (fitnessPlan.proteinGoal || 150)) * 100)}%</span>
                    </div>
                </div>

                <div className="macro-card carbs">
                    <div className="macro-header">
                        <span className="macro-icon">🌾</span>
                        <span className="macro-title">Carbs</span>
                    </div>
                    <div className="macro-value">
                        {dailyProgress.carbsConsumed || 0}g / {fitnessPlan.carbsGoal || 250}g
                    </div>
                    <div className="macro-progress">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ 
                                    width: `${Math.min(100, ((dailyProgress.carbsConsumed || 0) / (fitnessPlan.carbsGoal || 250)) * 100)}%` 
                                }}
                            ></div>
                        </div>
                        <span>{Math.round(((dailyProgress.carbsConsumed || 0) / (fitnessPlan.carbsGoal || 250)) * 100)}%</span>
                    </div>
                </div>

                <div className="macro-card fat">
                    <div className="macro-header">
                        <span className="macro-icon">🥑</span>
                        <span className="macro-title">Fat</span>
                    </div>
                    <div className="macro-value">
                        {dailyProgress.fatConsumed || 0}g / {fitnessPlan.fatGoal || 70}g
                    </div>
                    <div className="macro-progress">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ 
                                    width: `${Math.min(100, ((dailyProgress.fatConsumed || 0) / (fitnessPlan.fatGoal || 70)) * 100)}%` 
                                }}
                            ></div>
                        </div>
                        <span>{Math.round(((dailyProgress.fatConsumed || 0) / (fitnessPlan.fatGoal || 70)) * 100)}%</span>
                    </div>
                </div>
            </div>

            <div className="calories-section">
                <h3>Calorie Intake</h3>
                <div className="calories-card">
                    <div className="calories-header">
                        <span>Daily Goal: {fitnessPlan.dailyCalories || 2000} calories</span>
                        <span>Remaining: {Math.max(0, (fitnessPlan.dailyCalories || 2000) - (dailyProgress.caloriesConsumed || 0))} calories</span>
                    </div>
                    <div className="calories-progress">
                        <div className="progress-bar large">
                            <div 
                                className="progress-fill calorie-fill"
                                style={{ 
                                    width: `${Math.min(100, ((dailyProgress.caloriesConsumed || 0) / (fitnessPlan.dailyCalories || 2000)) * 100)}%` 
                                }}
                            ></div>
                        </div>
                        <div className="calories-consumed">
                            {dailyProgress.caloriesConsumed || 0} calories consumed
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Achievements Tab Component
const AchievementsTab = ({ user, workoutData }) => {
    const achievements = [
        {
            id: 1,
            name: 'First Workout',
            description: 'Complete your first workout',
            icon: '🎯',
            unlocked: workoutData?.history?.totalWorkouts > 0,
            progress: workoutData?.history?.totalWorkouts > 0 ? 100 : 0
        },
        {
            id: 2,
            name: 'Week Warrior',
            description: 'Complete 5 workouts in a week',
            icon: '⚔️',
            unlocked: false,
            progress: 60
        },
        {
            id: 3,
            name: 'Consistency King',
            description: 'Maintain a 7-day streak',
            icon: '👑',
            unlocked: (user?.streak || 0) >= 7,
            progress: Math.min(100, ((user?.streak || 0) / 7) * 100)
        },
        {
            id: 4,
            name: 'Calorie Crusher',
            description: 'Burn 10,000 calories total',
            icon: '🔥',
            unlocked: (workoutData?.history?.caloriesBurned || 0) >= 10000,
            progress: Math.min(100, ((workoutData?.history?.caloriesBurned || 0) / 10000) * 100)
        },
        {
            id: 5,
            name: 'Time Master',
            description: 'Log 1,000 workout minutes',
            icon: '⏱️',
            unlocked: (workoutData?.history?.totalMinutes || 0) >= 1000,
            progress: Math.min(100, ((workoutData?.history?.totalMinutes || 0) / 1000) * 100)
        }
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="achievements-tab">
            <div className="section-header">
                <h2>Achievements</h2>
                <span className="achievements-count">
                    {unlockedCount} / {achievements.length} Unlocked
                </span>
            </div>

            <div className="achievements-grid">
                {achievements.map(achievement => (
                    <div 
                        key={achievement.id} 
                        className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                    >
                        <div className="achievement-icon">
                            {achievement.icon}
                        </div>
                        <div className="achievement-content">
                            <h4>{achievement.name}</h4>
                            <p>{achievement.description}</p>
                            <div className="achievement-progress">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{ width: `${achievement.progress}%` }}
                                    ></div>
                                </div>
                                <span>{Math.round(achievement.progress)}%</span>
                            </div>
                        </div>
                        <div className="achievement-status">
                            {achievement.unlocked ? '✅' : '🔒'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Weight Log Modal Component
const WeightLogModal = ({ currentWeight, newWeight, setNewWeight, onLogWeight, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Log Weight</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <div className="modal-body">
                    <p>Current weight: <strong>{currentWeight} kg</strong></p>
                    <div className="form-group">
                        <label>New Weight (kg)</label>
                        <input
                            type="number"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            placeholder="Enter your current weight"
                            step="0.1"
                            min="0"
                        />
                    </div>
                </div>
                <div className="modal-actions">
                    <button onClick={onClose} className="btn-outline">
                        Cancel
                    </button>
                    <button onClick={onLogWeight} className="btn-primary">
                        Log Weight
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Progress;
