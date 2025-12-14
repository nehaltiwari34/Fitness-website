import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/History.css';

const History = () => {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockHistory = [
      {
        id: 1,
        date: "2024-01-15",
        workout: "Upper Body Strength",
        duration: 45,
        calories: 320,
        exercises: [
          { name: "Bench Press", sets: 3, reps: "8-12" },
          { name: "Pull-ups", sets: 3, reps: "8-10" },
          { name: "Shoulder Press", sets: 3, reps: "10-12" }
        ],
        notes: "Felt strong today, increased weight on bench press",
        rating: 4
      },
      {
        id: 2,
        date: "2024-01-14",
        workout: "Cardio & Core",
        duration: 30,
        calories: 280,
        exercises: [
          { name: "Running", sets: 1, reps: "20 min" },
          { name: "Plank", sets: 3, reps: "60s" },
          { name: "Russian Twists", sets: 3, reps: "15-20" }
        ],
        notes: "Good cardio session, maintained steady pace",
        rating: 5
      },
      {
        id: 3,
        date: "2024-01-12",
        workout: "Lower Body Strength",
        duration: 50,
        calories: 380,
        exercises: [
          { name: "Squats", sets: 4, reps: "8-10" },
          { name: "Deadlifts", sets: 3, reps: "6-8" },
          { name: "Lunges", sets: 3, reps: "12-15" }
        ],
        notes: "Challenging workout, legs feeling strong",
        rating: 4
      },
      {
        id: 4,
        date: "2024-01-10",
        workout: "Full Body HIIT",
        duration: 35,
        calories: 350,
        exercises: [
          { name: "Burpees", sets: 4, reps: "15-20" },
          { name: "Kettlebell Swings", sets: 3, reps: "20-25" },
          { name: "Box Jumps", sets: 3, reps: "10-12" }
        ],
        notes: "High intensity, good sweat session",
        rating: 5
      }
    ];

    const mockStats = {
      totalWorkouts: 24,
      currentStreak: 5,
      totalCalories: 12450,
      averageDuration: 42,
      favoriteWorkout: "Upper Body Strength",
      completionRate: 85
    };

    setWorkoutHistory(mockHistory);
    setStats(mockStats);
  }, []);

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Workout History</h1>
        <p>Track your progress and celebrate your fitness journey milestones</p>
        <Link to="/workouts" className="back-link">← Back to Workouts</Link>
      </div>

      <div className="stats-overview">
        <h2>Your Fitness Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalWorkouts}</div>
            <div className="stat-label">Total Workouts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.currentStreak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalCalories}</div>
            <div className="stat-label">Calories Burned</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>
      </div>

      <div className="period-filters">
        <button 
          className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('week')}
        >
          This Week
        </button>
        <button 
          className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('month')}
        >
          This Month
        </button>
        <button 
          className={`period-btn ${selectedPeriod === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('all')}
        >
          All Time
        </button>
      </div>

      <div className="workout-history">
        <h2>Recent Workouts</h2>
        {workoutHistory.map(workout => (
          <div key={workout.id} className="workout-log">
            <div className="log-header">
              <h3>{workout.workout}</h3>
              <div className="log-date">{workout.date}</div>
            </div>
            
            <div className="log-details">
              <div className="detail-item">
                <span>⏱️ Duration:</span>
                <span>{workout.duration} minutes</span>
              </div>
              <div className="detail-item">
                <span>🔥 Calories:</span>
                <span>{workout.calories} cal</span>
              </div>
              <div className="detail-item">
                <span>⭐ Rating:</span>
                <span>{'★'.repeat(workout.rating)}{'☆'.repeat(5-workout.rating)}</span>
              </div>
            </div>

            <div className="exercises-preview">
              <strong>Exercises:</strong>
              <div className="exercise-tags">
                {workout.exercises.map((exercise, index) => (
                  <span key={index} className="exercise-tag">{exercise.name}</span>
                ))}
              </div>
            </div>

            {workout.notes && (
              <div className="workout-notes">
                <strong>Notes:</strong> {workout.notes}
              </div>
            )}

            <button className="view-details-btn">View Full Details</button>
          </div>
        ))}
      </div>

      {workoutHistory.length === 0 && (
        <div className="no-history">
          <p>No workout history found for the selected period.</p>
          <Link to="/workouts" className="start-workout-btn">Start Your First Workout</Link>
        </div>
      )}
    </div>
  );
};

export default History;