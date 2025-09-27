import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Workouts.css';

const Workouts = () => {
    const [userData, setUserData] = useState({
        plan: {},
        exercises: [],
        programs: [],
        history: {}
    });

    // Simulated data fetch - replace with actual API calls
    useEffect(() => {
        const fetchData = async () => {
            // In a real app, you would fetch from your backend API
            const mockData = {
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
                    completionRate: "28%"
                },
                exercises: [
                    { name: "Bench Press", category: "Chest", equipment: "Barbell" },
                    { name: "Squats", category: "Legs", equipment: "Barbell" },
                    { name: "Deadlifts", category: "Back", equipment: "Barbell" },
                    { name: "Pull-ups", category: "Back", equipment: "Bodyweight" }
                ],
                programs: [
                    { 
                        name: "4-Week Shed", 
                        duration: "4 weeks", 
                        focus: "Fat Loss", 
                        difficulty: "Intermediate",
                        description: "High-intensity interval training program designed to maximize fat burn"
                    },
                    { 
                        name: "Beginner Strength", 
                        duration: "8 weeks", 
                        focus: "Muscle Building", 
                        difficulty: "Beginner",
                        description: "Perfect for those new to weight training with focus on proper form"
                    },
                    { 
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
                        { date: "2023-10-15", workout: "Upper Body", duration: "45 min", calories: 320 },
                        { date: "2023-10-14", workout: "Cardio", duration: "30 min", calories: 280 },
                        { date: "2023-10-12", workout: "Lower Body", duration: "50 min", calories: 380 }
                    ]
                }
            };
            
            setUserData(mockData);
        };

        fetchData();
    }, []);

    return (
        <div className="workouts-container">
            <div className="workouts-header">
                <h1>Workouts</h1>
                <p>Your complete fitness training hub</p>
                <Link to="/workouts/create" className="btn-primary">
                    CREATE NEW WORKOUT
                </Link>
            </div>

            <div className="workouts-grid">
                {/* My Plan Card */}
                <div className="workout-card">
                    <div className="card-header">
                        <h2>My Plan</h2>
                        <div className="completion-badge">{userData.plan.completionRate} complete</div>
                    </div>
                    <p>{userData.plan.description}</p>

                    <div className="weekly-schedule">
                        {userData.plan.weeklySchedule?.map((day, index) => (
                            <div key={index} className={`schedule-day ${day.completed ? 'completed' : ''}`}>
                                <span className="day-name">{day.day}</span>
                                <span className="workout-type">{day.workout}</span>
                                <span className="status-indicator">{day.completed ? '✓' : '→'}</span>
                            </div>
                        ))}
                    </div>
                    
                    <Link to="/my-plan" className="card-link">View Full Plan →</Link>
                </div>

                {/* Exercise Library Card */}
                <div className="workout-card">
                    <div className="card-header">
                        <h2>Exercise Library</h2>
                        <div className="exercise-count">500+ exercises</div>
                    </div>
                    <p>Access our comprehensive library with HD video demonstrations and form guidance</p>
                    
                    <div className="exercise-categories">
                        <span className="category-tag active">All</span>
                        <span className="category-tag">Chest</span>
                        <span className="category-tag">Legs</span>
                        <span className="category-tag">Back</span>
                        <span className="category-tag">Cardio</span>
                    </div>
                    
                    <div className="exercise-preview">
                        {userData.exercises.slice(0, 3).map((exercise, index) => (
                            <div key={index} className="exercise-item">
                                <span className="exercise-name">{exercise.name}</span>
                                <span className="exercise-details">{exercise.category} • {exercise.equipment}</span>
                            </div>
                        ))}
                    </div>
                    
                    <Link to="/exercises" className="card-link">Browse All Exercises →</Link>
                </div>

                {/* Programs Card */}
                <div className="workout-card">
                    <div className="card-header">
                        <h2>Programs</h2>
                        <div className="programs-count">12 programs</div>
                    </div>
                    <p>Structured workout programs designed by certified fitness experts</p>
                    
                    <div className="programs-list">
                        {userData.programs.map((program, index) => (
                            <div key={index} className="program-item">
                                <div className="program-info">
                                    <h4>{program.name}</h4>
                                    <p>{program.description}</p>
                                    <div className="program-meta">
                                        <span className="program-duration">{program.duration}</span>
                                        <span className="program-difficulty">{program.difficulty}</span>
                                    </div>
                                </div>
                                <button className="btn-outline">View Program</button>
                            </div>
                        ))}
                    </div>
                    
                    <Link to="/programs" className="card-link">Explore All Programs →</Link>
                </div>

                {/* History Card */}
                <div className="workout-card">
                    <div className="card-header">
                        <h2>History</h2>
                        <div className="history-stats">
                            <span className="stat">{userData.history.totalWorkouts} workouts</span>
                        </div>
                    </div>
                    <p>Track your progress and celebrate your fitness journey milestones</p>
                    
                    <div className="history-highlights">
                        <div className="stat-card">
                            <div className="stat-number">{userData.history.streak}</div>
                            <div className="stat-label">Day Streak</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{userData.history.caloriesBurned}</div>
                            <div className="stat-label">Calories Burned</div>
                        </div>
                    </div>
                    
                    <div className="recent-workouts">
                        <h4>Recent Workouts</h4>
                        {userData.history.recentWorkouts?.slice(0, 2).map((workout, index) => (
                            <div key={index} className="workout-log">
                                <span className="workout-date">{workout.date}</span>
                                <span className="workout-details">{workout.workout} • {workout.duration}</span>
                                <span className="workout-calories">{workout.calories} cal</span>
                            </div>
                        ))}
                    </div>
                    
                    <Link to="/history" className="card-link">View Full History →</Link>
                </div>
            </div>

            {/* Recent Workouts Section */}
            <div className="recent-workouts-section">
                <h2>Recent Workouts</h2>
                <div className="workouts-list">
                    {userData.history.recentWorkouts?.map((workout, index) => (
                        <div key={index} className="workout-item">
                            <div className="workout-info">
                                <h3>{workout.workout}</h3>
                                <p>{workout.date} • {workout.duration}</p>
                            </div>
                            <div className="workout-stats">
                                <span className="calories-burned">{workout.calories} cal burned</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Workouts;