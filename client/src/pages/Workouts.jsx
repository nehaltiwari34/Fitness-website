import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useWorkout } from '../context/WorkoutContext';
import { api } from '../utils/api';
import '../css/Workouts.css';

const Workouts = () => {
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    const { 
        workoutData, 
        loading: workoutLoading, 
        error: workoutError,
        startWorkout,
        logQuickWorkout,
        refreshData,
        markWorkoutComplete
    } = useWorkout();
    
    const [activeTab, setActiveTab] = useState('dashboard');
    const [exercises, setExercises] = useState([]);
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [liveWorkouts, setLiveWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quickWorkoutLoading, setQuickWorkoutLoading] = useState(false);
    const [realTimeUpdates, setRealTimeUpdates] = useState(0);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [connectionTested, setConnectionTested] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const navigate = useNavigate();

    // Check if user is authenticated
    if (!user) {
        return (
            <div className="workouts-container">
                <div className="auth-required-message">
                    <h2>🔒 Authentication Required</h2>
                    <p>Please log in to access your workouts</p>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="btn-primary"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Test API connection before fetching data
    const testAPIConnection = async () => {
        try {
            console.log('🔧 Testing workout API connection...');
            const response = await api.get('/workouts/public-health');
            console.log('✅ Workout API connection successful:', response.data.message);
            return true;
        } catch (error) {
            console.error('❌ Workout API connection failed:', error.message);
            setApiError('Workout service is temporarily unavailable. Please try again later.');
            return false;
        }
    };

    // Fetch all workout data with error handling - FIXED: Added request limiting
    const fetchWorkoutData = useCallback(async () => {
        if (!user || isFetching) {
            console.log('⏸️ Skipping fetch - already fetching or no user');
            return;
        }
        
        try {
            setIsFetching(true);
            setLoading(true);
            setApiError(null);
            console.log('🔄 Fetching real workout data from API...');
            
            // Test API connection first
            if (!connectionTested) {
                const isConnected = await testAPIConnection();
                if (!isConnected) {
                    setLoading(false);
                    setIsFetching(false);
                    setConnectionTested(true);
                    return;
                }
                setConnectionTested(true);
            }
            
            // Fetch from real API endpoints with better error handling
            const [todayRes, exercisesRes, plansRes, historyRes] = await Promise.all([
                api.get('/workouts/today').catch(err => {
                    console.log('❌ Today workout API error:', err.response?.data || err.message);
                    
                    // Handle authentication errors
                    if (err.response?.status === 401) {
                        console.log('🔒 Authentication failed, redirecting to login');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                        return { data: { success: false } };
                    }
                    
                    // Handle server errors
                    if (err.response?.status === 500) {
                        console.log('⚠️ Server error, using fallback data');
                        return { data: { success: false, workout: getFallbackWorkout() } };
                    }
                    
                    return { data: { success: false, workout: getFallbackWorkout() } };
                }),
                
                api.get('/workouts/exercises?limit=50').catch(err => {
                    console.log('❌ Exercises API error:', err.message);
                    return { data: { success: false, exercises: getFallbackExercises() } };
                }),
                
                api.get('/workouts/plans').catch(err => {
                    console.log('❌ Plans API error:', err.message);
                    return { data: { success: false, plans: [] } };
                }),
                
                api.get('/workouts/sessions/history?limit=10').catch(err => {
                    console.log('❌ History API error:', err.message);
                    return { data: { success: false, workouts: [] } };
                })
            ]);

            // Check if today workout failed due to auth
            if (todayRes.data && todayRes.data.success === false && !todayRes.data.workout) {
                if (todayRes.data.message?.includes('authenticated') || todayRes.data.message?.includes('token')) {
                    setApiError('Session expired. Please log in again.');
                    setTimeout(() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }, 2000);
                    return;
                }
            }

            // Process responses
            if (todayRes.data && todayRes.data.success && todayRes.data.workout) {
                console.log('✅ Today workout loaded:', todayRes.data.workout.name);
            }

            setExercises(exercisesRes.data?.exercises || exercisesRes.data || []);
            setWorkoutPlans(plansRes.data?.plans || plansRes.data || []);
            setWorkoutHistory(historyRes.data?.workouts || historyRes.data || []);

            console.log('✅ Workout data loaded successfully');
            console.log('   Exercises:', exercisesRes.data?.exercises?.length || 0);
            console.log('   Plans:', plansRes.data?.plans?.length || 0);
            console.log('   History:', historyRes.data?.workouts?.length || 0);
            
        } catch (error) {
            console.error('❌ Workout API error:', error);
            setApiError('Failed to load workout data. Using fallback data.');
            
            // Set fallback data
            setExercises(getFallbackExercises());
            setWorkoutPlans([]);
            setWorkoutHistory([]);
        } finally {
            setLoading(false);
            setIsFetching(false);
        }
    }, [user, connectionTested, isFetching]);

    // Fallback workout data
    const getFallbackWorkout = () => ({
        _id: 'fallback-1',
        name: 'Full Body Strength Training',
        description: 'Comprehensive workout for all fitness levels',
        duration: 45,
        calories: 280,
        difficulty: 'Intermediate',
        type: 'strength',
        exercises: [
            { name: 'Push-ups', sets: 3, reps: '12-15', rest: '60s', instructions: 'Keep your body straight and lower until chest nearly touches floor' },
            { name: 'Squats', sets: 3, reps: '12-15', rest: '60s', instructions: 'Squat down as if sitting in a chair, keep chest up' },
            { name: 'Plank', sets: 3, reps: '30-45s', rest: '30s', instructions: 'Maintain straight line from head to heels' }
        ]
    });

    // Fallback exercises
    const getFallbackExercises = () => [
        { _id: '1', name: 'Push-ups', category: 'Strength', difficulty: 'Beginner', equipment: ['Bodyweight'], muscleGroup: 'Chest, Shoulders, Triceps' },
        { _id: '2', name: 'Squats', category: 'Strength', difficulty: 'Beginner', equipment: ['Bodyweight'], muscleGroup: 'Legs, Glutes' },
        { _id: '3', name: 'Plank', category: 'Core', difficulty: 'Beginner', equipment: ['Bodyweight'], muscleGroup: 'Core, Abs' }
    ];

    // Real-time updates - FIXED: Removed fetchWorkoutData calls that cause loops
    useEffect(() => {
        if (user) {
            fetchWorkoutData();
        }
    }, [user]); // Removed fetchWorkoutData and refreshData from dependencies

    useEffect(() => {
        if (socket) {
            socket.on('workoutStarted', (data) => {
                console.log('🔥 Live workout started:', data);
                setRealTimeUpdates(prev => prev + 1);
                setLiveWorkouts(prev => [...prev, data]);
            });

            socket.on('workoutCompleted', (data) => {
                console.log('✅ Live workout completed:', data);
                setRealTimeUpdates(prev => prev + 1);
                setLiveWorkouts(prev => prev.filter(w => w.sessionId !== data.sessionId));
                // Just update local state, don't trigger API calls
            });

            return () => {
                socket.off('workoutStarted');
                socket.off('workoutCompleted');
            };
        }
    }, [socket]); // Removed fetchWorkoutData and refreshData from dependencies

    // Action handlers
    const handleStartWorkout = async (workout) => {
        try {
            console.log('🏋️ Starting workout:', workout);
            const result = await startWorkout({
                workoutTemplateId: workout._id,
                name: workout.name,
                customExercises: workout.exercises?.map(ex => ex.exercise?._id || ex._id)
            });

            if (result.success) {
                navigate(`/workout/${result.workoutSession._id}`);
            }
        } catch (error) {
            console.error('Start workout error:', error);
            alert('Failed to start workout. Please try again.');
        }
    };

    const handleQuickWorkout = async (type) => {
        try {
            setQuickWorkoutLoading(true);
            const result = await logQuickWorkout(type);
            
            if (result.success) {
                alert(result.message);
                // Manually refresh data after quick workout
                fetchWorkoutData();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Quick workout error:', error);
            alert('Failed to log workout. Please try again.');
        } finally {
            setQuickWorkoutLoading(false);
        }
    };

    const handleMarkComplete = async (workoutId) => {
        try {
            const result = await markWorkoutComplete(workoutId);
            if (result.success) {
                alert(result.message);
                fetchWorkoutData();
            }
        } catch (error) {
            console.error('Mark complete error:', error);
        }
    };

    const calculatePlanProgress = (plan) => {
        if (!plan.workouts || plan.workouts.length === 0) return 0;
        const completedWorkouts = plan.workouts.filter(w => w.completed).length;
        return Math.round((completedWorkouts / plan.workouts.length) * 100);
    };

    // Use fallback data if API failed
    const todayWorkout = workoutData?.todayWorkout || getFallbackWorkout();
    const history = workoutData?.history || {};

    if ((loading || workoutLoading) && !apiError) {
        return (
            <div className="workouts-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your workout data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="workouts-container">
            {/* Connection Status */}
            <div className="connection-status">
                <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? '🔌 Live' : '🔴 Offline'}
                </div>
                <span>Real-time updates {isConnected ? 'active' : 'paused'}</span>
                {realTimeUpdates > 0 && (
                    <span className="update-badge">{realTimeUpdates} updates</span>
                )}
                {liveWorkouts.length > 0 && (
                    <span className="live-workouts-badge">
                        🔥 {liveWorkouts.length} live workout{liveWorkouts.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Header */}
            <div className="workouts-header">
                <h1>Workout Dashboard</h1>
                <p>Track your fitness journey and stay motivated</p>
            </div>

            {/* Error Banner */}
            {(workoutError || apiError) && (
                <div className="error-banner">
                    ⚠️ {workoutError || apiError}
                    <div className="error-actions">
                        <button onClick={fetchWorkoutData} className="retry-btn">Retry</button>
                        {apiError?.includes('Session expired') && (
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    window.location.href = '/login';
                                }}
                                className="login-btn"
                            >
                                Log In Again
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="workouts-nav">
                <button 
                    className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    📊 Dashboard
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'plans' ? 'active' : ''}`}
                    onClick={() => setActiveTab('plans')}
                >
                    📅 Workout Plans
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'exercises' ? 'active' : ''}`}
                    onClick={() => setActiveTab('exercises')}
                >
                    💪 Exercise Library
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    📈 History
                </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <DashboardTab 
                    todayWorkout={todayWorkout}
                    workoutHistory={workoutHistory}
                    weeklyStats={history.analytics || {}}
                    onQuickWorkout={handleQuickWorkout}
                    onStartWorkout={handleStartWorkout}
                    quickWorkoutLoading={quickWorkoutLoading}
                    liveWorkouts={liveWorkouts}
                    setSelectedWorkout={setSelectedWorkout}
                />
            )}

            {/* Workout Plans Tab */}
            {activeTab === 'plans' && (
                <WorkoutPlansTab 
                    workoutPlans={workoutPlans}
                    onStartWorkout={handleStartWorkout}
                    onMarkComplete={handleMarkComplete}
                />
            )}

            {/* Exercise Library Tab */}
            {activeTab === 'exercises' && (
                <ExerciseLibraryTab 
                    exercises={exercises}
                    onCreateWorkout={() => navigate('/workouts/create')}
                />
            )}

            {/* Workout History Tab */}
            {activeTab === 'history' && (
                <WorkoutHistoryTab 
                    workoutHistory={workoutHistory}
                />
            )}

            {/* Workout Detail Modal */}
            {selectedWorkout && (
                <WorkoutDetailModal 
                    workout={selectedWorkout}
                    onClose={() => setSelectedWorkout(null)}
                    onStartWorkout={handleStartWorkout}
                />
            )}
        </div>
    );
};

// Dashboard Tab Component
const DashboardTab = ({ todayWorkout, workoutHistory, weeklyStats, onQuickWorkout, onStartWorkout, quickWorkoutLoading, liveWorkouts, setSelectedWorkout }) => {
    const weeklyProgress = weeklyStats ? Math.min(100, (weeklyStats.workoutsCompleted || 0 / 5) * 100) : 0;

    return (
        <div className="dashboard-tab">
            {/* Quick Stats */}
            <div className="workout-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-content">
                        <h3>{weeklyStats?.totalWorkouts || 0}</h3>
                        <p>Total Workouts</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-content">
                        <h3>{weeklyStats?.totalMinutes || 0}</h3>
                        <p>Minutes Trained</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💪</div>
                    <div className="stat-content">
                        <h3>{weeklyStats?.streak || 0}</h3>
                        <p>Current Streak</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <h3>{(weeklyStats?.totalCalories || 0).toLocaleString()}</h3>
                        <p>Calories Burned</p>
                    </div>
                </div>
            </div>

            {/* Weekly Progress */}
            <div className="weekly-progress-section">
                <h3>Weekly Goal Progress</h3>
                <div className="progress-card">
                    <div className="progress-header">
                        <span>{weeklyStats?.workoutsCompleted || 0} / 5 workouts</span>
                        <span>{Math.round(weeklyProgress)}%</span>
                    </div>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ width: `${weeklyProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions-grid">
                    <button 
                        className="quick-action-btn primary"
                        onClick={() => onQuickWorkout('30-Min')}
                        disabled={quickWorkoutLoading}
                    >
                        <span className="action-icon">⚡</span>
                        <span className="action-text">Log 30-Min Workout</span>
                        <span className="action-subtext">~250 calories</span>
                    </button>
                    <button 
                        className="quick-action-btn"
                        onClick={() => onQuickWorkout('15-Min')}
                        disabled={quickWorkoutLoading}
                    >
                        <span className="action-icon">🚀</span>
                        <span className="action-text">Log Quick Workout</span>
                        <span className="action-subtext">~120 calories</span>
                    </button>
                    <Link to="/exercises" className="quick-action-btn">
                        <span className="action-icon">📚</span>
                        <span className="action-text">Exercise Library</span>
                        <span className="action-subtext">500+ exercises</span>
                    </Link>
                    <Link to="/create-workout" className="quick-action-btn">
                        <span className="action-icon">➕</span>
                        <span className="action-text">Create Workout</span>
                        <span className="action-subtext">Custom plan</span>
                    </Link>
                </div>
            </div>

            {/* Live Workouts */}
            {liveWorkouts.length > 0 && (
                <div className="live-workouts-section">
                    <h3>Live Workouts</h3>
                    <div className="live-workouts-list">
                        {liveWorkouts.map((liveWorkout, index) => (
                            <div key={index} className="live-workout-card">
                                <div className="live-indicator"></div>
                                <div className="live-workout-info">
                                    <h4>{liveWorkout.workoutName}</h4>
                                    <span>Started {new Date(liveWorkout.startTime).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Today's Workout */}
            <div className="today-workout-section">
                <div className="section-header">
                    <h2>Today's Workout</h2>
                    <span className="live-badge">RECOMMENDED</span>
                </div>
                {todayWorkout ? (
                    <div className="workout-card featured">
                        <div className="workout-header">
                            <h3>{todayWorkout.name}</h3>
                            <div className="workout-meta">
                                <span>⏱️ {todayWorkout.duration} min</span>
                                <span>🔥 {todayWorkout.calories} cal</span>
                                <span>📊 {todayWorkout.difficulty || 'Moderate'}</span>
                            </div>
                        </div>
                        <div className="workout-exercises-preview">
                            {todayWorkout.exercises?.slice(0, 3).map((exercise, index) => (
                                <div key={index} className="exercise-preview">
                                    <span className="exercise-name">{exercise.name}</span>
                                    <span className="exercise-sets">{exercise.sets} sets × {exercise.reps}</span>
                                </div>
                            ))}
                            {todayWorkout.exercises?.length > 3 && (
                                <div className="more-exercises">
                                    +{todayWorkout.exercises.length - 3} more exercises
                                </div>
                            )}
                        </div>
                        <div className="workout-actions">
                            <button 
                                onClick={() => onStartWorkout(todayWorkout)}
                                className="btn-primary"
                            >
                                Start Workout
                            </button>
                            <button 
                                onClick={() => setSelectedWorkout(todayWorkout)}
                                className="btn-outline"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="no-workout-card">
                        <div className="no-workout-icon">💪</div>
                        <h3>No Workout Scheduled</h3>
                        <p>Take a rest day or create a new workout plan</p>
                        <Link to="/create-plan" className="btn-primary">
                            Create Plan
                        </Link>
                    </div>
                )}
            </div>

            {/* Recent Workouts */}
            <div className="recent-workouts-section">
                <div className="section-header">
                    <h2>Recent Workouts</h2>
                    <Link to="/workout-history" className="btn-outline">
                        View All
                    </Link>
                </div>
                <div className="workouts-list">
                    {workoutHistory.length > 0 ? (
                        workoutHistory.slice(0, 5).map(workout => (
                            <div key={workout._id} className="workout-item">
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
                                <div className="workout-actions">
                                    <button 
                                        className="btn-text"
                                        onClick={() => setSelectedWorkout(workout)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-workouts">
                            <p>No recent workouts. Start your fitness journey today!</p>
                            <button 
                                onClick={() => onQuickWorkout('15-Min')}
                                className="btn-primary"
                            >
                                Start Quick Workout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Workout Plans Tab Component
const WorkoutPlansTab = ({ workoutPlans, onStartWorkout, onMarkComplete }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);

    return (
        <div className="plans-tab">
            <div className="section-header">
                <h2>My Workout Plans</h2>
                <Link to="/create-plan" className="btn-primary">
                    + New Plan
                </Link>
            </div>

            <div className="plans-grid">
                {workoutPlans.length > 0 ? (
                    workoutPlans.map(plan => (
                        <div key={plan._id} className="plan-card">
                            <div className="plan-header">
                                <h4>{plan.name}</h4>
                                <span className={`plan-status ${plan.completed ? 'completed' : 'active'}`}>
                                    {plan.completed ? 'Completed' : 'Active'}
                                </span>
                            </div>
                            <p className="plan-description">{plan.description}</p>
                            <div className="plan-progress">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{ width: `${plan.progress || 0}%` }}
                                    ></div>
                                </div>
                                <span className="progress-text">
                                    {plan.progress || 0}% Complete
                                </span>
                            </div>
                            <div className="plan-meta">
                                <span>🎯 {plan.goal}</span>
                                <span>📊 {plan.difficulty}</span>
                                <span>⏱️ {plan.duration} weeks</span>
                            </div>
                            <div className="plan-workouts">
                                <h5>Workouts ({plan.weeklySchedule?.reduce((total, day) => total + (day.workouts?.length || 0), 0) || 0})</h5>
                                {plan.weeklySchedule?.slice(0, 3).map((day, dayIndex) => (
                                    day.workouts?.slice(0, 2).map((workout, workoutIndex) => (
                                        <div key={`${dayIndex}-${workoutIndex}`} className="plan-workout-item">
                                            <span>{workout.workout?.name || `Workout ${workoutIndex + 1}`}</span>
                                            <button 
                                                className={`status-btn ${workout.completed ? 'completed' : ''}`}
                                                onClick={() => onMarkComplete(workout._id)}
                                            >
                                                {workout.completed ? '✅' : '⚪'}
                                            </button>
                                        </div>
                                    ))
                                ))}
                            </div>
                            <div className="plan-actions">
                                <button 
                                    onClick={() => setSelectedPlan(plan)}
                                    className="btn-outline small"
                                >
                                    View Details
                                </button>
                                <button 
                                    onClick={() => onStartWorkout(plan.weeklySchedule?.[0]?.workouts?.[0]?.workout)}
                                    className="btn-primary small"
                                    disabled={!plan.weeklySchedule || plan.weeklySchedule.length === 0}
                                >
                                    Start Next
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-plans-card">
                        <div className="no-plans-icon">📅</div>
                        <h4>No Workout Plans</h4>
                        <p>Create your first workout plan to get started</p>
                        <Link to="/create-plan" className="btn-primary">
                            Create Plan
                        </Link>
                    </div>
                )}
            </div>

            {/* Plan Detail Modal */}
            {selectedPlan && (
                <PlanDetailModal 
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    onStartWorkout={onStartWorkout}
                />
            )}
        </div>
    );
};

// Exercise Library Tab Component
const ExerciseLibraryTab = ({ exercises, onCreateWorkout }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExercises, setSelectedExercises] = useState([]);

    const categories = ['all', 'Strength', 'Cardio', 'Flexibility', 'HIIT', 'Core', 'Upper Body', 'Lower Body'];

    const filteredExercises = exercises.filter(exercise => {
        const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
        const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (exercise.muscleGroup && exercise.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleAddToWorkout = (exercise) => {
        setSelectedExercises(prev => [...prev, exercise]);
    };

    const handleRemoveFromWorkout = (exerciseId) => {
        setSelectedExercises(prev => prev.filter(ex => ex._id !== exerciseId));
    };

    return (
        <div className="exercises-tab">
            <div className="section-header">
                <h2>Exercise Library</h2>
                <div className="exercises-controls">
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-select"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Selected Exercises */}
            {selectedExercises.length > 0 && (
                <div className="selected-exercises">
                    <h3>Selected for Workout ({selectedExercises.length})</h3>
                    <div className="selected-list">
                        {selectedExercises.map(exercise => (
                            <div key={exercise._id} className="selected-exercise">
                                <span>{exercise.name}</span>
                                <button 
                                    onClick={() => handleRemoveFromWorkout(exercise._id)}
                                    className="remove-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={onCreateWorkout}
                        className="btn-primary"
                    >
                        Create Workout with {selectedExercises.length} Exercises
                    </button>
                </div>
            )}

            {/* Exercises Grid */}
            <div className="exercises-grid">
                {filteredExercises.length > 0 ? (
                    filteredExercises.map(exercise => (
                        <div key={exercise._id} className="exercise-card">
                            <div className="exercise-image">
                                <img 
                                    src={exercise.imageUrl || '/default-exercise.jpg'} 
                                    alt={exercise.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = '/default-exercise.jpg';
                                    }}
                                />
                                <span className="exercise-category">{exercise.category}</span>
                            </div>
                            <div className="exercise-content">
                                <h4>{exercise.name}</h4>
                                <p className="exercise-muscle">{exercise.muscleGroup || 'Full Body'}</p>
                                <p className="exercise-description">{exercise.description || 'No description available.'}</p>
                                <div className="exercise-difficulty">
                                    <span>Difficulty: {exercise.difficulty}</span>
                                </div>
                                <div className="exercise-actions">
                                    <button 
                                        onClick={() => handleAddToWorkout(exercise)}
                                        className="btn-primary small"
                                    >
                                        Add to Workout
                                    </button>
                                    <Link 
                                        to={`/exercise/${exercise._id}`}
                                        className="btn-outline small"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-exercises">
                        <p>No exercises found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Workout History Tab Component
const WorkoutHistoryTab = ({ workoutHistory }) => {
    const [timeFilter, setTimeFilter] = useState('all');

    const filteredWorkouts = workoutHistory.filter(workout => {
        if (timeFilter === 'all') return true;
        
        const workoutDate = new Date(workout.completedAt);
        const now = new Date();
        const diffTime = Math.abs(now - workoutDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (timeFilter === 'week') return diffDays <= 7;
        if (timeFilter === 'month') return diffDays <= 30;
        return true;
    });

    return (
        <div className="history-tab">
            <div className="section-header">
                <h2>Workout History</h2>
                <select 
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="time-filter"
                >
                    <option value="all">All Time</option>
                    <option value="month">Last 30 Days</option>
                    <option value="week">Last 7 Days</option>
                </select>
            </div>

            <div className="workout-history">
                {filteredWorkouts.length > 0 ? (
                    <div className="history-list">
                        {filteredWorkouts.map(workout => (
                            <div key={workout._id} className="history-item">
                                <div className="history-date">
                                    {new Date(workout.completedAt).toLocaleDateString()}
                                </div>
                                <div className="history-details">
                                    <h4>{workout.name}</h4>
                                    <div className="workout-stats">
                                        <span>⏱️ {workout.duration} min</span>
                                        <span>🔥 {workout.caloriesBurned} cal</span>
                                        <span>💪 {workout.exercises?.length || 0} exercises</span>
                                    </div>
                                </div>
                                <div className="history-rating">
                                    {workout.rating && (
                                        <div className="rating-stars">
                                            {'⭐'.repeat(workout.rating)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-history">
                        <p>No workout history found for the selected period.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Modal Components
const WorkoutDetailModal = ({ workout, onClose, onStartWorkout }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content large">
                <div className="modal-header">
                    <h3>{workout.name}</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <div className="workout-detail">
                    <div className="workout-meta">
                        <span>⏱️ {workout.duration} minutes</span>
                        <span>🔥 {workout.calories} calories</span>
                        <span>📊 {workout.difficulty}</span>
                    </div>
                    
                    <div className="exercises-list">
                        <h4>Exercises</h4>
                        {workout.exercises?.map((exercise, index) => (
                            <div key={index} className="exercise-detail">
                                <h5>{exercise.name}</h5>
                                <div className="exercise-sets">
                                    <span>{exercise.sets} sets × {exercise.reps} reps</span>
                                    {exercise.rest && <span>Rest: {exercise.rest}</span>}
                                </div>
                                {exercise.instructions && (
                                    <p className="exercise-instructions">{exercise.instructions}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="modal-actions">
                        <button onClick={onClose} className="btn-outline">
                            Close
                        </button>
                        <button 
                            onClick={() => {
                                onStartWorkout(workout);
                                onClose();
                            }}
                            className="btn-primary"
                        >
                            Start Workout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlanDetailModal = ({ plan, onClose, onStartWorkout }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content large">
                <div className="modal-header">
                    <h3>{plan.name}</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <div className="plan-detail">
                    <p className="plan-description">{plan.description}</p>
                    
                    <div className="plan-stats">
                        <div className="stat">
                            <span>Goal</span>
                            <strong>{plan.goal}</strong>
                        </div>
                        <div className="stat">
                            <span>Difficulty</span>
                            <strong>{plan.difficulty}</strong>
                        </div>
                        <div className="stat">
                            <span>Duration</span>
                            <strong>{plan.duration} weeks</strong>
                        </div>
                        <div className="stat">
                            <span>Progress</span>
                            <strong>{plan.progress}%</strong>
                        </div>
                    </div>

                    <div className="workouts-list">
                        <h4>Weekly Schedule</h4>
                        {plan.weeklySchedule?.map((day, index) => (
                            <div key={index} className="day-schedule">
                                <h5>{day.day}</h5>
                                {day.workouts?.map((workout, workoutIndex) => (
                                    <div key={workoutIndex} className="workout-in-plan">
                                        <div className="workout-info">
                                            <h6>{workout.workout?.name || `Workout ${workoutIndex + 1}`}</h6>
                                            <span>{workout.workout?.duration || 30} min • {workout.workout?.calories || 200} cal</span>
                                        </div>
                                        <button 
                                            onClick={() => onStartWorkout(workout.workout)}
                                            className="btn-primary small"
                                        >
                                            Start
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="modal-actions">
                        <button onClick={onClose} className="btn-outline">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workouts;
