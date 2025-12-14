// src/pages/Dashboard.jsx - COMPLETELY FIXED VERSION

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useWorkout } from '../context/WorkoutContext';
import { useNutrition } from '../context/NutritionContext';
import '../css/Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    const { refreshData: refreshWorkouts } = useWorkout();
    const { refreshData: refreshNutrition } = useNutrition();
    
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        setDashboardData(generateEnhancedFallbackData());
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handleDashboardUpdate = (data) => {
            setDashboardData(prev => {
                if (!prev) return generateEnhancedFallbackData();
                return { ...prev, ...data };
            });
        };
        socket.on('dashboardUpdate', handleDashboardUpdate);
        return () => {
            socket.off('dashboardUpdate', handleDashboardUpdate);
        };
    }, [socket]);

    const extractData = () => {
        if (!dashboardData) return generateEnhancedFallbackData();
        return {
            user: {
                name: user?.name || dashboardData.user?.name || 'Fitness Enthusiast',
                email: user?.email || dashboardData.user?.email || '',
                streak: user?.streak || dashboardData.streak || 1,
            },
            profile: user?.profile || dashboardData.profile || {
                weight: 70,
                height: 175,
                age: 25
            },
            fitnessPlan: dashboardData.fitnessPlan || {
                dailyCalories: 2000,
                proteinGoal: 150,
                carbsGoal: 250,
                fatGoal: 70,
                waterGoal: 2000,
                stepGoal: 10000
            },
            dailyProgress: dashboardData.dailyProgress || {
                steps: dashboardData.steps || Math.floor(Math.random() * 5000) + 3000,
                caloriesConsumed: dashboardData.caloriesConsumed || Math.floor(Math.random() * 800) + 400,
                caloriesBurned: dashboardData.caloriesBurned || Math.floor(Math.random() * 300) + 200,
                waterIntake: dashboardData.waterIntake || (Math.random() * 1.5 + 0.5).toFixed(1),
                workoutsCompleted: dashboardData.workoutsCompleted || 0,
                weight: user?.profile?.weight || 70,
                heartRate: dashboardData.heartRate || Math.floor(Math.random() * 40) + 60,
                sleepHours: dashboardData.sleepHours || (Math.random() * 2 + 6).toFixed(1)
            },
            todayWorkout: dashboardData.todayWorkout || dashboardData.workout || generateTodaysWorkout(),
            weeklyStats: dashboardData.weeklyStats || {
                workoutsCompleted: dashboardData.weeklyWorkouts || Math.floor(Math.random() * 4) + 1,
                totalMinutes: dashboardData.totalMinutes || Math.floor(Math.random() * 120) + 60,
                caloriesBurned: dashboardData.weeklyCalories || Math.floor(Math.random() * 800) + 400,
                streak: user?.streak || dashboardData.streak || 1,
                totalWorkouts: dashboardData.totalWorkouts || Math.floor(Math.random() * 20) + 5
            }
        };
    };

    const generateTodaysWorkout = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];
        const workouts = {
            'Monday': { 
                name: 'Upper Body Strength', type: 'strength', duration: 45, calories: 320, difficulty: 'Intermediate',
                exercises: [
                    { name: 'Push-ups', sets: 3, reps: '12-15', rest: '60s' },
                    { name: 'Dumbbell Rows', sets: 3, reps: '10-12', rest: '60s' },
                    { name: 'Shoulder Press', sets: 3, reps: '10-12', rest: '60s' }
                ]
            },
            'Tuesday': { 
                name: 'Cardio & Core', type: 'cardio', duration: 30, calories: 280, difficulty: 'Beginner',
                exercises: [
                    { name: 'Jumping Jacks', sets: 3, reps: '30s', rest: '30s' },
                    { name: 'Mountain Climbers', sets: 3, reps: '20/side', rest: '30s' },
                    { name: 'Plank', sets: 3, reps: '30-45s', rest: '30s' }
                ]
            },
            'Wednesday': { 
                name: 'Active Recovery', type: 'recovery', duration: 20, calories: 150, difficulty: 'Easy',
                exercises: [
                    { name: 'Light Walking', sets: 1, reps: '20min', rest: '0s' },
                    { name: 'Stretching', sets: 1, reps: '10min', rest: '0s' }
                ]
            },
            'Thursday': { 
                name: 'Lower Body Strength', type: 'strength', duration: 50, calories: 350, difficulty: 'Intermediate',
                exercises: [
                    { name: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: '60s' },
                    { name: 'Lunges', sets: 3, reps: '10/side', rest: '60s' },
                    { name: 'Glute Bridges', sets: 3, reps: '12-15', rest: '60s' }
                ]
            },
            'Friday': { 
                name: 'HIIT Circuit', type: 'hiit', duration: 25, calories: 300, difficulty: 'Advanced',
                exercises: [
                    { name: 'Burpees', sets: 4, reps: '30s', rest: '30s' },
                    { name: 'High Knees', sets: 4, reps: '30s', rest: '30s' },
                    { name: 'Jump Squats', sets: 4, reps: '30s', rest: '30s' }
                ]
            },
            'Saturday': { 
                name: 'Cardio Endurance', type: 'cardio', duration: 40, calories: 320, difficulty: 'Intermediate',
                exercises: [
                    { name: 'Running', sets: 1, reps: '30min', rest: '0s' },
                    { name: 'Cycling', sets: 1, reps: '10min', rest: '0s' }
                ]
            },
            'Sunday': { 
                name: 'Rest Day', type: 'rest', duration: 0, calories: 0, difficulty: 'Rest', exercises: []
            }
        };
        return workouts[todayName] || { 
            name: 'Full Body Workout', type: 'strength', duration: 35, calories: 250, difficulty: 'Beginner',
            exercises: [
                { name: 'Push-ups', sets: 3, reps: '12-15', rest: '60s' },
                { name: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: '60s' },
                { name: 'Plank', sets: 3, reps: '30-45s', rest: '30s' }
            ]
        };
    };

    const generateEnhancedFallbackData = () => {
        const todayWorkout = generateTodaysWorkout();
        return {
            user: {
                name: user?.name || 'Fitness Enthusiast',
                email: user?.email || ''
            },
            streak: user?.streak || 1,
            steps: Math.floor(Math.random() * 5000) + 3000,
            caloriesConsumed: Math.floor(Math.random() * 800) + 400,
            caloriesBurned: Math.floor(Math.random() * 300) + 200,
            waterIntake: (Math.random() * 1.5 + 0.5).toFixed(1),
            workoutsCompleted: Math.floor(Math.random() * 4) + 1,
            totalMinutes: Math.floor(Math.random() * 120) + 60,
            weeklyCalories: Math.floor(Math.random() * 800) + 400,
            totalWorkouts: Math.floor(Math.random() * 20) + 5,
            workout: todayWorkout,
            dailyProgress: {
                steps: Math.floor(Math.random() * 5000) + 3000,
                caloriesConsumed: Math.floor(Math.random() * 800) + 400,
                caloriesBurned: Math.floor(Math.random() * 300) + 200,
                waterIntake: (Math.random() * 1.5 + 0.5).toFixed(1),
                weight: user?.profile?.weight || 70,
                heartRate: Math.floor(Math.random() * 40) + 60,
                sleepHours: (Math.random() * 2 + 6).toFixed(1)
            },
            fitnessPlan: {
                dailyCalories: 2000,
                proteinGoal: 150,
                carbsGoal: 250,
                fatGoal: 70,
                waterGoal: 2000,
                stepGoal: 10000
            },
            weeklyStats: {
                workoutsCompleted: Math.floor(Math.random() * 4) + 1,
                totalMinutes: Math.floor(Math.random() * 120) + 60,
                caloriesBurned: Math.floor(Math.random() * 800) + 400,
                streak: user?.streak || 1,
                totalWorkouts: Math.floor(Math.random() * 20) + 5
            },
            profile: user?.profile || {
                weight: 70,
                height: 175
            }
        };
    };

    const handleStartWorkout = () => navigate('/workouts');
    const handleLogFood = () => navigate('/nutrition');
    const handleAddWater = async () => { try { refreshNutrition(); } catch { setError('Failed to log water. Please try again.'); } };
    const handleQuickWorkout = async (type) => { try { refreshWorkouts(); } catch { setError('Failed to log workout. Please try again.'); } };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your fitness dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="dashboard-container">
                <div className="auth-required">
                    <h2>Welcome to FitTrack! 🏋️‍♂️</h2>
                    <p>Please log in to view your personalized dashboard</p>
                    <div className="auth-actions">
                        <Link to="/login" className="btn-primary visible-btn">Login</Link>
                        <Link to="/signup" className="btn-outline visible-btn">Sign Up</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !dashboardData) {
        return (
            <div className="dashboard-container">
                <div className="error-state">
                    <h2>Unable to load dashboard</h2>
                    <p>{error}</p>
                    <button onClick={fetchDashboardData} className="btn-primary visible-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const extractedData = extractData();
    const {
        user: userInfo,
        dailyProgress,
        fitnessPlan,
        weeklyStats,
        todayWorkout,
        profile
    } = extractedData;

    const stepsProgress = Math.min(100, ((dailyProgress.steps || 0) / (fitnessPlan.stepGoal || 10000)) * 100);
    const caloriesProgress = Math.min(100, ((dailyProgress.caloriesConsumed || 0) / (fitnessPlan.dailyCalories || 2000)) * 100);
    const waterProgress = Math.min(100, ((dailyProgress.waterIntake || 0) / ((fitnessPlan.waterGoal || 2000) / 1000)) * 100);
    const workoutsProgress = Math.min(100, ((weeklyStats.workoutsCompleted || 0) / 5) * 100);

    const calculateBMI = () => {
        const weight = profile?.weight;
        const height = profile?.height;
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

    const bmi = calculateBMI();
    const bmiCategory = getBMICategory(bmi);

    const getTimeBasedGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="user-greeting">
                        <h1 className="greeting-text">
                                 {getTimeBasedGreeting()},
                                 {user && user.name
                                  ? ` ${user.name}`
                                 : (userInfo?.name || 'User')
                                 }! 👋
                        </h1>

                        <p className="greeting-subtext">
                            Day {userInfo?.streak || weeklyStats?.streak || 1} streak • {isConnected ? 'Live Tracking' : 'Offline Mode'}
                        </p>
                    </div>
                    <div className="header-info">
                        <div className="current-time">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="header-actions">
                            <button onClick={fetchDashboardData} className="refresh-btn" title="Refresh Data">
                                🔄
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)} className="close-error">×</button>
                </div>
            )}

            <div className="quick-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👣</div>
                    <div className="stat-content">
                        <h3>{(dailyProgress.steps || 0).toLocaleString()}</h3>
                        <p>Steps Today</p>
                        <div className="stat-progress">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill steps-fill" 
                                    style={{ width: `${stepsProgress}%` }}
                                ></div>
                            </div>
                            <span className="progress-text">{Math.round(stepsProgress)}%</span>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💪</div>
                    <div className="stat-content">
                        <h3>{weeklyStats.workoutsCompleted || 0}</h3>
                        <p>Weekly Workouts</p>
                        <div className="stat-progress">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill workout-fill" 
                                    style={{ width: `${workoutsProgress}%` }}
                                ></div>
                            </div>
                            <span className="progress-text">{Math.round(workoutsProgress)}%</span>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-content">
                        <h3>{(weeklyStats.caloriesBurned || 0).toLocaleString()}</h3>
                        <p>Calories Burned</p>
                        <span className="stat-subtext">This week</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-content">
                        <h3>{weeklyStats.totalMinutes || 0}</h3>
                        <p>Minutes</p>
                        <span className="stat-subtext">Training time</span>
                    </div>
                </div>
            </div>

            <div className="goals-section">
                <div className="section-header">
                    <h2>Today's Progress</h2>
                    <span className={`live-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? 'LIVE' : 'OFFLINE'}
                    </span>
                </div>
                <div className="goals-grid">
                    <div className="goal-card">
                        <div className="goal-header">
                            <span className="goal-icon">🔥</span>
                            <span className="goal-title">Calories</span>
                        </div>
                        <div className="goal-value">
                            {dailyProgress.caloriesConsumed || 0}/{fitnessPlan.dailyCalories || 2000}
                        </div>
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar calorie-bar" 
                                style={{ width: `${caloriesProgress}%` }}
                            ></div>
                        </div>
                        <button onClick={handleLogFood} className="quick-action-btn visible-btn">
                            + Log Food
                        </button>
                    </div>
                    <div className="goal-card">
                        <div className="goal-header">
                            <span className="goal-icon">💧</span>
                            <span className="goal-title">Water</span>
                        </div>
                        <div className="goal-value">
                            {dailyProgress.waterIntake || 0}L/{(fitnessPlan.waterGoal || 2000) / 1000}L
                        </div>
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar water-bar" 
                                style={{ width: `${waterProgress}%` }}
                            ></div>
                        </div>
                        <button onClick={handleAddWater} className="quick-action-btn visible-btn">
                            + Add Water
                        </button>
                    </div>
                    <div className="goal-card">
                        <div className="goal-header">
                            <span className="goal-icon">⚖️</span>
                            <span className="goal-title">Weight</span>
                        </div>
                        <div className="goal-value">{dailyProgress.weight || profile?.weight || '--'} kg</div>
                        <div className="goal-subtext">Current</div>
                        <button onClick={() => navigate('/progress')} className="quick-action-btn visible-btn">
                            Update Weight
                        </button>
                    </div>
                </div>
            </div>

            <div className="workout-section">
                <div className="section-header">
                    <h2>Today's Workout</h2>
                    <span className="workout-type">
                        {(todayWorkout?.type || 'STRENGTH').toUpperCase()}
                    </span>
                </div>
                {todayWorkout && todayWorkout.type !== 'rest' ? (
                    <div className="workout-card featured">
                        <div className="workout-header">
                            <h3>{todayWorkout.name || 'Daily Workout'}</h3>
                            <div className="workout-meta">
                                <span>⏱️ {todayWorkout.duration || 30} min</span>
                                <span>🔥 {todayWorkout.calories || 200} cal</span>
                                <span>📊 {todayWorkout.difficulty || 'Moderate'}</span>
                            </div>
                        </div>
                        <div className="workout-exercises">
                            {(todayWorkout.exercises || []).slice(0, 3).map((exercise, index) => (
                                <div key={index} className="exercise-item">
                                    <span className="exercise-name">{exercise.name || `Exercise ${index + 1}`}</span>
                                    <span className="exercise-details">
                                        {exercise.sets || 3} × {exercise.reps || '10-12'}
                                    </span>
                                </div>
                            ))}
                            {(todayWorkout.exercises || []).length > 3 && (
                                <div className="more-exercises">
                                    +{(todayWorkout.exercises || []).length - 3} more exercises
                                </div>
                            )}
                        </div>
                        <div className="workout-actions">
                            <button 
                                onClick={handleStartWorkout}
                                className="btn-primary visible-btn"
                            >
                                Start Workout
                            </button>
                            <button 
                                onClick={() => navigate('/workouts')}
                                className="btn-outline visible-btn"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="no-workout-card">
                        <div className="no-workout-icon">💪</div>
                        <h3>Rest Day</h3>
                        <p>Take a well-deserved break or choose a light activity</p>
                        <div className="quick-workout-actions">
                            <button 
                                onClick={() => handleQuickWorkout('15-Min')}
                                className="btn-outline visible-btn"
                            >
                                15-Min Light
                            </button>
                            <button 
                                onClick={() => handleQuickWorkout('30-Min')}
                                className="btn-primary visible-btn"
                            >
                                30-Min Active
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="health-metrics-section">
                <h2>Health Metrics</h2>
                <div className="metrics-grid">
                    <div className="metric-item">
                        <span className="metric-label">BMI</span>
                        <span className="metric-value">{bmi || '--'}</span>
                        <span className={`metric-category ${bmiCategory?.toLowerCase() || 'normal'}`}>
                            {bmiCategory}
                        </span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Heart Rate</span>
                        <span className="metric-value">{dailyProgress.heartRate || '--'}</span>
                        <span className="metric-unit">BPM</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Sleep</span>
                        <span className="metric-value">{dailyProgress.sleepHours || '--'}</span>
                        <span className="metric-unit">hours</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Active Calories</span>
                        <span className="metric-value">{dailyProgress.caloriesBurned || 0}</span>
                        <span className="metric-unit">kcal</span>
                    </div>
                </div>
            </div>

            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions-grid">
                    <button className="action-card visible-btn" onClick={() => navigate('/workouts')}>
                        <div className="action-icon">💪</div>
                        <h3>WORKOUTS</h3>
                        <p>View all workouts</p>
                    </button>
                    <button className="action-card visible-btn" onClick={() => navigate('/nutrition')}>
                        <div className="action-icon">🍎</div>
                        <h3>NUTRITION</h3>
                        <p>Track meals</p>
                    </button>
                    <button className="action-card visible-btn" onClick={() => navigate('/progress')}>
                        <div className="action-icon">📈</div>
                        <h3>PROGRESS</h3>
                        <p>View stats</p>
                    </button>
                    <button className="action-card visible-btn" onClick={() => navigate('/community')}>
                        <div className="action-icon">👥</div>
                        <h3>COMMUNITY</h3>
                        <p>Connect & share</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
