import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import '../css/Dashboard.css';

const Dashboard = () => {
    const { user, logout, loading: authLoading } = useAuth();
    const [userData, setUserData] = useState(null);
    const [todayWorkout, setTodayWorkout] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch dashboard data when user is available
    useEffect(() => {
        if (!authLoading && user) {
            fetchUserData();
            fetchTodayWorkout();
        }
    }, [user, authLoading]);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/api/profile');
            if (response.data.success) {
                setUserData(response.data.user);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setDashboardLoading(false);
        }
    };

    const fetchTodayWorkout = async () => {
        try {
            const response = await api.get('/api/profile/workout/today');
            if (response.data.success) {
                setTodayWorkout(response.data.workout);
            }
        } catch (error) {
            console.error('Error fetching workout:', error);
        }
    };

    const updateDailyProgress = async (updates) => {
        try {
            const response = await api.post('/api/profile/progress', updates);
            if (response.data.success) {
                fetchUserData(); // Refresh data
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Show login prompt if user is not authenticated
    if (!user) {
        return (
            <div className="dashboard-container">
                <div className="auth-required">
                    <h2>Welcome to FitTrack! 🏋️‍♂️</h2>
                    <p>Please log in to view your personalized dashboard</p>
                    <div className="auth-actions">
                        <Link to="/login" className="btn-primary">Login</Link>
                        <Link to="/signup" className="btn-outline">Sign Up</Link>
                    </div>
                </div>
            </div>
        );
    }

    // Check if profile is incomplete - redirect to profile setup
    if (user && (!user.profile || !user.profile.height)) {
        navigate('/profile-setup');
        return null;
    }

    // Show dashboard loading
    if (dashboardLoading || !userData) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your personalized fitness data...</p>
                </div>
            </div>
        );
    }

    const progress = userData?.dailyProgress || {};
    const fitnessPlan = userData?.fitnessPlan || {};
    const profile = userData?.profile || {};

    // Calculate progress percentages
    const caloriesProgress = Math.min(100, ((progress.caloriesConsumed || 0) / (fitnessPlan.dailyCalories || 2000)) * 100);
    const waterProgress = Math.min(100, ((progress.waterIntake || 0) / ((fitnessPlan.waterGoal || 2000) / 1000)) * 100);
    const stepsProgress = Math.min(100, ((progress.steps || 0) / (fitnessPlan.stepGoal || 10000)) * 100);
    const workoutsProgress = Math.min(100, ((progress.workoutsCompleted || 0) / (fitnessPlan.workoutGoal || 16)) * 100);
    
    // Calculate weight progress
    const currentWeight = progress.weight || profile.weight;
    const weightGoal = currentWeight ? Math.max(50, currentWeight - 3) : 0;
    const weightDifference = currentWeight ? currentWeight - weightGoal : 0;

    // Get personalized metrics based on user profile
    const getPersonalizedMetrics = () => {
        const age = profile.age || 30;
        const weight = profile.weight || 70;
        const height = profile.height || 170;
        const fitnessLevel = profile.fitnessLevel || 'beginner';
        
        // Calculate personalized metrics
        const bmi = weight / ((height / 100) ** 2);
        const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
        
        // Calculate heart rate zones
        const maxHR = 220 - age;
        const fatBurnZone = `${Math.round(maxHR * 0.6)}-${Math.round(maxHR * 0.7)}`;
        const cardioZone = `${Math.round(maxHR * 0.7)}-${Math.round(maxHR * 0.85)}`;
        
        return { bmi: bmi.toFixed(1), bmiCategory, maxHR, fatBurnZone, cardioZone };
    };

    const metrics = getPersonalizedMetrics();

    // Generate smart activity feed
    const generateActivityFeed = () => {
        const activities = [];
        const now = new Date();
        
        // Add workout if completed today
        if (progress.workoutsCompleted > 0) {
            activities.push({
                type: 'workout',
                name: todayWorkout?.workoutName || 'Personalized Workout',
                time: 'This Morning',
                duration: `${todayWorkout?.duration || 45} min`,
                calories: todayWorkout?.estimatedCalories || 280,
                icon: '💪'
            });
        }
        
        // Add water reminders
        if (progress.waterIntake < (fitnessPlan.waterGoal / 1000)) {
            activities.push({
                type: 'reminder',
                name: 'Stay Hydrated',
                time: 'Just Now',
                message: `You've had ${progress.waterIntake}L of water today`,
                icon: '💧'
            });
        }
        
        // Add step progress
        if (progress.steps > 0) {
            activities.push({
                type: 'steps',
                name: 'Step Progress',
                time: 'Today',
                steps: progress.steps,
                goal: fitnessPlan.stepGoal,
                icon: '👣'
            });
        }
        
        // Add weight tracking
        if (currentWeight) {
            activities.push({
                type: 'weight',
                name: 'Weight Tracking',
                time: 'Today',
                value: `${currentWeight}kg`,
                trend: weightDifference > 0 ? 'losing' : 'maintaining',
                icon: '⚖️'
            });
        }
        
        return activities;
    };

    const activityFeed = generateActivityFeed();

    // Get time-based greeting
    const getTimeBasedGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="dashboard-container">
            {/* Smartwatch-style Header */}
            <div className="smartwatch-header">
                <div className="time-display">
                    <div className="current-time">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="current-date">
                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
                <div className="user-greeting">
                    <h1>{getTimeBasedGreeting()}, {userData?.name}! 👋</h1>
                    <p>Day {userData?.streak || 1} of your fitness journey</p>
                </div>
                <button onClick={logout} className="logout-btn">Logout</button>
            </div>

            {/* Quick Stats Overview - Smartwatch Style */}
            <div className="quick-stats">
                <div className="stat-circle">
                    <div className="stat-value">{progress.steps || 0}</div>
                    <div className="stat-label">Steps</div>
                    <div className="stat-progress">
                        <div className="circular-progress" style={{ 
                            background: `conic-gradient(var(--primary) ${stepsProgress}%, #e0e0e0 0%)` 
                        }}></div>
                    </div>
                </div>
                <div className="stat-circle">
                    <div className="stat-value">{progress.workoutsCompleted || 0}</div>
                    <div className="stat-label">Workouts</div>
                    <div className="stat-progress">
                        <div className="circular-progress" style={{ 
                            background: `conic-gradient(var(--success) ${workoutsProgress}%, #e0e0e0 0%)` 
                        }}></div>
                    </div>
                </div>
                <div className="stat-circle">
                    <div className="stat-value">{progress.waterIntake || 0}L</div>
                    <div className="stat-label">Water</div>
                    <div className="stat-progress">
                        <div className="circular-progress" style={{ 
                            background: `conic-gradient(var(--info) ${waterProgress}%, #e0e0e0 0%)` 
                        }}></div>
                    </div>
                </div>
            </div>

            {/* Health Metrics */}
            <div className="health-metrics">
                <h2>Health Metrics</h2>
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon">❤️</div>
                        <div className="metric-info">
                            <div className="metric-value">{metrics.maxHR} BPM</div>
                            <div className="metric-label">Max Heart Rate</div>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">📊</div>
                        <div className="metric-info">
                            <div className="metric-value">{metrics.bmi}</div>
                            <div className="metric-label">BMI • {metrics.bmiCategory}</div>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">🔥</div>
                        <div className="metric-info">
                            <div className="metric-value">{metrics.fatBurnZone}</div>
                            <div className="metric-label">Fat Burn Zone</div>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">💓</div>
                        <div className="metric-info">
                            <div className="metric-value">{metrics.cardioZone}</div>
                            <div className="metric-label">Cardio Zone</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Goals Progress */}
            <div className="goals-section">
                <h2>Today's Progress</h2>
                <div className="goals-grid">
                    <div className="goal-progress">
                        <div className="goal-header">
                            <span className="goal-icon">🔥</span>
                            <span className="goal-title">Calories</span>
                        </div>
                        <div className="goal-value">{progress.caloriesConsumed || 0}/{fitnessPlan.dailyCalories || 2000}</div>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${caloriesProgress}%` }}></div>
                        </div>
                        <button 
                            onClick={() => updateDailyProgress({ caloriesConsumed: (progress.caloriesConsumed || 0) + 200 })}
                            className="quick-action-btn"
                        >
                            + Log Meal
                        </button>
                    </div>

                    <div className="goal-progress">
                        <div className="goal-header">
                            <span className="goal-icon">💧</span>
                            <span className="goal-title">Water</span>
                        </div>
                        <div className="goal-value">{progress.waterIntake || 0}L/{(fitnessPlan.waterGoal || 2000) / 1000}L</div>
                        <div className="progress-bar-container">
                            <div className="progress-bar water" style={{ width: `${waterProgress}%` }}></div>
                        </div>
                        <button 
                            onClick={() => updateDailyProgress({ waterIntake: (progress.waterIntake || 0) + 0.5 })}
                            className="quick-action-btn"
                        >
                            + Add Water
                        </button>
                    </div>

                    <div className="goal-progress">
                        <div className="goal-header">
                            <span className="goal-icon">👣</span>
                            <span className="goal-title">Steps</span>
                        </div>
                        <div className="goal-value">{(progress.steps || 0).toLocaleString()}/{(fitnessPlan.stepGoal || 10000).toLocaleString()}</div>
                        <div className="progress-bar-container">
                            <div className="progress-bar steps" style={{ width: `${stepsProgress}%` }}></div>
                        </div>
                        <button 
                            onClick={() => updateDailyProgress({ steps: (progress.steps || 0) + 1000 })}
                            className="quick-action-btn"
                        >
                            + Sync Steps
                        </button>
                    </div>
                </div>
            </div>

            {/* Today's Workout */}
            {todayWorkout && (
                <div className="workout-section">
                    <div className="section-header">
                        <h2>Today's Workout</h2>
                        <span className="workout-duration">⏱️ {todayWorkout.duration} min</span>
                    </div>
                    <div className="workout-card">
                        <div className="workout-header">
                            <h3>{todayWorkout.workoutName}</h3>
                            <div className="workout-calories">🔥 {todayWorkout.estimatedCalories} kcal</div>
                        </div>
                        <div className="exercises-list">
                            {todayWorkout.exercises && todayWorkout.exercises.map((exercise, index) => (
                                <div key={index} className="exercise-item">
                                    <div className="exercise-info">
                                        <span className="exercise-name">{exercise.name || exercise}</span>
                                        {exercise.sets && (
                                            <span className="exercise-details">
                                                {exercise.sets} sets × {exercise.reps}
                                            </span>
                                        )}
                                    </div>
                                    {exercise.rest && (
                                        <span className="exercise-rest">🕒 {exercise.rest}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => updateDailyProgress({ workoutsCompleted: (progress.workoutsCompleted || 0) + 1 })}
                            className="start-workout-btn"
                        >
                            🏋️ Start Workout
                        </button>
                    </div>
                </div>
            )}

            {/* Activity Feed */}
            <div className="activity-feed">
                <h2>Recent Activity</h2>
                <div className="feed-items">
                    {activityFeed.map((activity, index) => (
                        <div key={index} className="feed-item">
                            <div className="feed-icon">{activity.icon}</div>
                            <div className="feed-content">
                                <div className="feed-title">{activity.name}</div>
                                <div className="feed-details">
                                    {activity.duration && <span>{activity.duration}</span>}
                                    {activity.calories && <span>{activity.calories} kcal</span>}
                                    {activity.steps && <span>{activity.steps} steps</span>}
                                    {activity.value && <span>{activity.value}</span>}
                                    {activity.message && <span>{activity.message}</span>}
                                </div>
                                <div className="feed-time">{activity.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-panel">
                <h2>Quick Actions</h2>
                <div className="action-grid">
                    <button 
                        onClick={() => updateDailyProgress({ workoutsCompleted: (progress.workoutsCompleted || 0) + 1 })}
                        className="action-button primary"
                    >
                        <span className="action-icon">💪</span>
                        <span className="action-text">Start Workout</span>
                    </button>
                    <button 
                        onClick={() => updateDailyProgress({ caloriesConsumed: (progress.caloriesConsumed || 0) + 200 })}
                        className="action-button"
                    >
                        <span className="action-icon">🍎</span>
                        <span className="action-text">Log Food</span>
                    </button>
                    <button 
                        onClick={() => {
                            const newWeight = prompt('Enter your current weight (kg):', currentWeight || '');
                            if (newWeight) {
                                updateDailyProgress({ weight: parseFloat(newWeight) });
                            }
                        }}
                        className="action-button"
                    >
                        <span className="action-icon">⚖️</span>
                        <span className="action-text">Log Weight</span>
                    </button>
                    <button 
                        onClick={() => updateDailyProgress({ waterIntake: (progress.waterIntake || 0) + 0.5 })}
                        className="action-button"
                    >
                        <span className="action-icon">💧</span>
                        <span className="action-text">Add Water</span>
                    </button>
                </div>
            </div>

            {/* AI Recommendations */}
            {fitnessPlan.recommendations && fitnessPlan.recommendations.length > 0 && (
                <div className="ai-recommendations">
                    <h2>🤖 AI Recommendations</h2>
                    <div className="recommendations-list">
                        {fitnessPlan.recommendations.map((rec, index) => (
                            <div key={index} className="recommendation-item">
                                <span className="rec-bullet">💡</span>
                                <span>{rec}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
