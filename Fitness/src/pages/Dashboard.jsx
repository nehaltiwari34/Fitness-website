import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Dashboard.css';

const Dashboard = () => {
    const { user, loading } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);

    // Fetch dashboard data when user is available
    useEffect(() => {
        if (!loading) {
            fetchDashboardData();
        }
    }, [user, loading]);

    const fetchDashboardData = async () => {
        try {
            // Simulate API call - replace with actual API
            setTimeout(() => {
                const data = {
                    user: {
                        name: user?.name || user?.email?.split('@')[0] || "Fitness Enthusiast",
                        streak: 5,
                        level: "Intermediate"
                    },
                    today: {
                        calories: {
                            consumed: 1850,
                            goal: 2200,
                            remaining: 350
                        },
                        workouts: 2,
                        water: 1.8,
                        steps: 8450
                    },
                    recentActivity: [
                        { type: 'workout', name: 'Morning Run', time: '7:30 AM', duration: '30 min', calories: 280 },
                        { type: 'meal', name: 'Protein Shake', time: '10:00 AM', calories: 180 },
                        { type: 'weight', name: 'Weight Check', time: '8:00 AM', value: '75.2 kg' },
                        { type: 'workout', name: 'Strength Training', time: '6:00 PM', duration: '45 min', calories: 320 }
                    ],
                    goals: {
                        weight: { current: 75.2, target: 72.0, unit: 'kg' },
                        workouts: { current: 12, target: 16, period: 'this month' }
                    }
                };
                setDashboardData(data);
                setDashboardLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setDashboardLoading(false);
        }
    };

    // Show loading while checking authentication
    if (loading) {
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

    // Show dashboard loading
    if (dashboardLoading || !dashboardData) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your fitness data...</p>
                </div>
            </div>
        );
    }

    const getActivityIcon = (type) => {
        switch (type) {
            case 'workout': return '💪';
            case 'meal': return '🍎';
            case 'weight': return '⚖️';
            default: return '📝';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'workout': return 'var(--primary)';
            case 'meal': return 'var(--success)';
            case 'weight': return 'var(--secondary)';
            default: return 'var(--dark)';
        }
    };

    // Calculate progress percentages
    const caloriesProgress = Math.min(100, (dashboardData.today.calories.consumed / dashboardData.today.calories.goal) * 100);
    const waterProgress = Math.min(100, (dashboardData.today.water / 2.5) * 100);
    const stepsProgress = Math.min(100, (dashboardData.today.steps / 10000) * 100);
    const workoutsProgress = Math.min(100, (dashboardData.goals.workouts.current / dashboardData.goals.workouts.target) * 100);
    
    // Calculate weight progress (inverse since we want to lose weight)
    const weightDifference = dashboardData.goals.weight.current - dashboardData.goals.weight.target;
    const weightProgress = weightDifference > 0 ? Math.min(100, (weightDifference / (dashboardData.goals.weight.current - 50)) * 100) : 100;

    return (
        <div className="dashboard-container">
            {/* Welcome Section */}
            <div className="dashboard-header">
                <h1>Welcome back, {dashboardData.user.name}! 👋</h1>
                <p>You're on a {dashboardData.user.streak}-day streak! Keep going! 🔥</p>
            </div>

            {/* Stats Section */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <span className="stat-value">{dashboardData.user.streak}</span>
                    <span className="stat-label">Day Streak</span>
                    <Link to="/progress" className="stat-link">View Progress</Link>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{dashboardData.user.level}</span>
                    <span className="stat-label">Fitness Level</span>
                    <Link to="/my-plan" className="stat-link">Update Level</Link>
                </div>
            </div>

            {/* Today's Overview */}
            <div className="today-overview">
                <h2>Today's Summary</h2>
                <div className="today-grid">
                    {/* Calories Card */}
                    <div className="today-card">
                        <h3>🔥 Calories</h3>
                        <div className="today-value">
                            {dashboardData.today.calories.consumed} / {dashboardData.today.calories.goal}
                        </div>
                        <div className="today-progress">
                            <div 
                                className="progress-bar"
                                style={{ width: `${caloriesProgress}%` }}
                            ></div>
                        </div>
                        <div className="today-time">
                            {dashboardData.today.calories.remaining} kcal remaining
                        </div>
                        <Link to="/nutrition" className="btn-outline">Log Food</Link>
                    </div>

                    {/* Workouts Card */}
                    <div className="today-card">
                        <h3>💪 Workouts</h3>
                        <div className="today-value">{dashboardData.today.workouts}</div>
                        <div className="today-time">completed today</div>
                        <div className="today-details">
                            <span className="workout-tag">Active Day</span>
                        </div>
                        <Link to="/workouts" className="btn-outline">Start New Workout</Link>
                    </div>

                    {/* Water Card */}
                    <div className="today-card">
                        <h3>💧 Water Intake</h3>
                        <div className="today-value">{dashboardData.today.water}L</div>
                        <div className="today-time">of 2.5L goal</div>
                        <div className="today-progress">
                            <div 
                                className="progress-bar"
                                style={{ width: `${waterProgress}%` }}
                            ></div>
                        </div>
                        <Link to="/nutrition" className="btn-outline">Add Water</Link>
                    </div>

                    {/* Steps Card */}
                    <div className="today-card">
                        <h3>👣 Steps</h3>
                        <div className="today-value">{dashboardData.today.steps.toLocaleString()}</div>
                        <div className="today-time">of 10,000 goal</div>
                        <div className="today-progress">
                            <div 
                                className="progress-bar"
                                style={{ width: `${stepsProgress}%` }}
                            ></div>
                        </div>
                        <Link to="/progress" className="btn-outline">Sync Device</Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <Link to="/nutrition" className="action-btn">
                        <span>🍎</span>
                        Log Food
                    </Link>
                    <Link to="/workouts" className="action-btn primary">
                        <span>💪</span>
                        Start Workout
                    </Link>
                    <Link to="/progress" className="action-btn">
                        <span>📊</span>
                        View Progress
                    </Link>
                    <Link to="/nutrition" className="action-btn">
                        <span>⚖️</span>
                        Log Weight
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="today-overview">
                <div className="section-header">
                    <h2>Recent Activity</h2>
                    <Link to="/history" className="stat-link">View All</Link>
                </div>
                <div className="activity-list">
                    {dashboardData.recentActivity.map((activity, index) => (
                        <div key={index} className="activity-item">
                            <div 
                                className="activity-icon"
                                style={{ backgroundColor: getActivityColor(activity.type) }}
                            >
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="activity-content">
                                <h4>{activity.name}</h4>
                                <div className="activity-details">
                                    <span className="activity-time">{activity.time}</span>
                                    {activity.duration && <span className="activity-duration">{activity.duration}</span>}
                                    {activity.calories && <span className="activity-calories">{activity.calories} kcal</span>}
                                    {activity.value && <span className="activity-value">{activity.value}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Goals Section */}
            <div className="today-overview">
                <h2>Your Goals</h2>
                <div className="goals-grid">
                    {/* Weight Goal */}
                    <div className="today-card">
                        <h3>⚖️ Weight Goal</h3>
                        <div className="today-value">
                            {dashboardData.goals.weight.current}kg → {dashboardData.goals.weight.target}kg
                        </div>
                        <div className="today-progress">
                            <div 
                                className="progress-bar"
                                style={{ width: `${weightProgress}%` }}
                            ></div>
                        </div>
                        <div className="today-time">
                            {Math.abs(weightDifference).toFixed(1)}kg {weightDifference > 0 ? 'to lose' : 'lost!'}
                        </div>
                    </div>

                    {/* Workout Goal */}
                    <div className="today-card">
                        <h3>💪 Workout Goal</h3>
                        <div className="today-value">
                            {dashboardData.goals.workouts.current} / {dashboardData.goals.workouts.target}
                        </div>
                        <div className="today-progress">
                            <div 
                                className="progress-bar"
                                style={{ width: `${workoutsProgress}%` }}
                            ></div>
                        </div>
                        <div className="today-time">
                            {dashboardData.goals.workouts.target - dashboardData.goals.workouts.current} more this month
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;