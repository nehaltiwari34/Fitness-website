import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WorkoutContext = createContext();

export const useWorkout = () => {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }
    return context;
};

export const WorkoutProvider = ({ children }) => {
    const [workoutData, setWorkoutData] = useState({
        plan: {},
        exercises: [],
        programs: [],
        history: {}
    });
    
    const [userLogs, setUserLogs] = useState({
        weightHistory: [],
        foodDiary: [],
        workoutHistory: []
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Mock data for development
    const mockWorkoutData = {
        plan: {
            title: "My Personalized Workout Plan",
            description: "Customized based on your fitness level and goals",
            weeklySchedule: [
                { day: "Monday", workout: "Upper Body Strength", completed: true },
                { day: "Tuesday", workout: "Cardio & Core", completed: false },
                { day: "Wednesday", workout: "Active Recovery", completed: false },
                { day: "Thursday", workout: "Lower Body Strength", completed: false },
                { day: "Friday", workout: "HIIT Circuit", completed: false },
                { day: "Saturday", workout: "Yoga & Flexibility", completed: false },
                { day: "Sunday", workout: "Rest Day", completed: false }
            ],
            completionRate: "28%",
            nextWorkout: "Cardio & Core"
        },
        exercises: [
            { id: 1, name: "Bench Press", category: "Chest", equipment: "Barbell", difficulty: "Intermediate" },
            { id: 2, name: "Squats", category: "Legs", equipment: "Barbell", difficulty: "Beginner" },
            { id: 3, name: "Deadlifts", category: "Back", equipment: "Barbell", difficulty: "Advanced" },
            { id: 4, name: "Pull-ups", category: "Back", equipment: "Bodyweight", difficulty: "Intermediate" }
        ],
        programs: [
            { 
                id: 1, 
                name: "4-Week Shed", 
                duration: "4 weeks", 
                focus: "Fat Loss", 
                difficulty: "Intermediate",
                description: "High-intensity interval training program designed to maximize fat burn"
            },
            { 
                id: 2, 
                name: "Beginner Strength", 
                duration: "8 weeks", 
                focus: "Muscle Building", 
                difficulty: "Beginner",
                description: "Perfect for those new to weight training with focus on proper form"
            },
            { 
                id: 3, 
                name: "Marathon Training", 
                duration: "16 weeks", 
                focus: "Endurance", 
                difficulty: "Advanced",
                description: "Comprehensive program for building endurance and running performance"
            }
        ],
        history: {
            totalWorkouts: 24,
            streak: 5,
            caloriesBurned: 12450,
            recentWorkouts: [
                { id: 1, date: "2024-01-15", workout: "Upper Body", duration: "45 min", calories: 320 },
                { id: 2, date: "2024-01-14", workout: "Cardio", duration: "30 min", calories: 280 },
                { id: 3, date: "2024-01-12", workout: "Lower Body", duration: "50 min", calories: 380 }
            ]
        }
    };

    // Mock user logs data for Progress.jsx
    const mockUserLogs = {
        weightHistory: [
            { id: 1, weight: 75.2, unit: 'kg', date: new Date().toISOString() },
            { id: 2, weight: 75.5, unit: 'kg', date: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, weight: 76.0, unit: 'kg', date: new Date(Date.now() - 172800000).toISOString() }
        ],
        foodDiary: [
            { id: 1, food: 'Protein Shake', calories: 180, mealType: 'Breakfast', date: new Date().toISOString() },
            { id: 2, food: 'Chicken Salad', calories: 350, mealType: 'Lunch', date: new Date().toISOString() },
            { id: 3, food: 'Greek Yogurt', calories: 120, mealType: 'Snack', date: new Date().toISOString() }
        ],
        workoutHistory: [
            { id: 1, type: 'cardio', duration: 30, caloriesBurned: 280, date: new Date().toISOString() },
            { id: 2, type: 'strength', duration: 45, caloriesBurned: 320, date: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, type: 'hiit', duration: 25, caloriesBurned: 250, date: new Date(Date.now() - 172800000).toISOString() }
        ]
    };

    // Fetch all data when user logs in
    useEffect(() => {
        if (user) {
            fetchAllData();
        } else {
            // Clear data when user logs out
            setWorkoutData({
                plan: {},
                exercises: [],
                programs: [],
                history: {}
            });
            setUserLogs({
                weightHistory: [],
                foodDiary: [],
                workoutHistory: []
            });
        }
    }, [user]);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Simulate API calls with delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setWorkoutData(mockWorkoutData);
            setUserLogs(mockUserLogs);
            
        } catch (err) {
            setError('Failed to fetch data');
            console.error('WorkoutContext Error:', err);
            
            // Fallback to mock data
            setWorkoutData(mockWorkoutData);
            setUserLogs(mockUserLogs);
        } finally {
            setLoading(false);
        }
    };

    // ===== WORKOUT PLAN FUNCTIONS =====
    const markWorkoutComplete = (dayIndex) => {
        setWorkoutData(prevData => {
            const updatedSchedule = [...prevData.plan.weeklySchedule];
            updatedSchedule[dayIndex] = {
                ...updatedSchedule[dayIndex],
                completed: true
            };
            
            const completedCount = updatedSchedule.filter(day => day.completed).length;
            const newCompletionRate = Math.round((completedCount / updatedSchedule.length) * 100) + '%';
            
            return {
                ...prevData,
                plan: {
                    ...prevData.plan,
                    weeklySchedule: updatedSchedule,
                    completionRate: newCompletionRate
                }
            };
        });
    };

    const addWorkoutToHistory = (workout) => {
        setWorkoutData(prevData => ({
            ...prevData,
            history: {
                ...prevData.history,
                totalWorkouts: prevData.history.totalWorkouts + 1,
                recentWorkouts: [workout, ...prevData.history.recentWorkouts.slice(0, 4)],
                caloriesBurned: prevData.history.caloriesBurned + (workout.calories || 0)
            }
        }));
    };

    const updateStreak = (newStreak) => {
        setWorkoutData(prevData => ({
            ...prevData,
            history: {
                ...prevData.history,
                streak: newStreak
            }
        }));
    };

    const searchExercises = (query, category = 'All') => {
        let filtered = mockWorkoutData.exercises;
        
        if (query) {
            filtered = filtered.filter(exercise => 
                exercise.name.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        if (category !== 'All') {
            filtered = filtered.filter(exercise => exercise.category === category);
        }
        
        return filtered;
    };

    const getProgramById = (programId) => {
        return mockWorkoutData.programs.find(program => program.id === programId);
    };

    const getExerciseById = (exerciseId) => {
        return mockWorkoutData.exercises.find(exercise => exercise.id === exerciseId);
    };

    // ===== USER LOGS FUNCTIONS (for Progress.jsx) =====
    const getWeightStats = () => {
        if (userLogs.weightHistory.length < 2) return null;
        
        const sortedWeights = [...userLogs.weightHistory].sort((a, b) => 
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
        
        return userLogs.workoutHistory.filter(workout => 
            new Date(workout.date) >= cutoffDate
        );
    };

    const getTodayCalories = () => {
        const today = new Date().toDateString();
        return userLogs.foodDiary
            .filter(food => new Date(food.date).toDateString() === today)
            .reduce((sum, food) => sum + food.calories, 0);
    };

    const getTodayFoods = () => {
        const today = new Date().toDateString();
        return userLogs.foodDiary.filter(food => 
            new Date(food.date).toDateString() === today
        );
    };

    // Function to add new weight entry
    const logWeight = (weightData) => {
        const newEntry = {
            id: Date.now(),
            ...weightData,
            date: new Date().toISOString()
        };
        
        setUserLogs(prev => ({
            ...prev,
            weightHistory: [...prev.weightHistory, newEntry]
        }));
    };

    // Function to add new food entry
    const logFood = (foodData) => {
        const newEntry = {
            id: Date.now(),
            ...foodData,
            date: new Date().toISOString()
        };
        
        setUserLogs(prev => ({
            ...prev,
            foodDiary: [...prev.foodDiary, newEntry]
        }));
    };

    // Function to add new workout to logs
    const logWorkout = (workoutData) => {
        const newEntry = {
            id: Date.now(),
            ...workoutData,
            date: new Date().toISOString()
        };
        
        setUserLogs(prev => ({
            ...prev,
            workoutHistory: [...prev.workoutHistory, newEntry]
        }));
        
        // Also add to workout history
        addWorkoutToHistory(newEntry);
    };

    const value = {
        // Workout data
        workoutData,
        loading,
        error,
        
        // Workout functions
        fetchWorkoutData: fetchAllData,
        markWorkoutComplete,
        addWorkoutToHistory,
        updateStreak,
        searchExercises,
        getProgramById,
        getExerciseById,
        
        // User logs data (for Progress.jsx)
        userLogs,
        
        // User logs functions (for Progress.jsx)
        getWeightStats,
        getRecentWorkouts,
        getTodayCalories,
        getTodayFoods,
        logWeight,
        logFood,
        logWorkout
    };

    return (
        <WorkoutContext.Provider value={value}>
            {children}
        </WorkoutContext.Provider>
    );
};