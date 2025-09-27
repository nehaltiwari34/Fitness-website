import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/MyPlan.css';

const MyPlan = () => {
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockPlan = {
      userName: "John Doe",
      fitnessGoal: "Muscle Gain",
      currentProgram: "Beginner Strength",
      weeklySchedule: [
        {
          day: "Monday",
          workout: "Chest & Triceps",
          exercises: [
            { name: "Bench Press", sets: 3, reps: "8-12", completed: true },
            { name: "Incline Dumbbell Press", sets: 3, reps: "10-15", completed: true },
            { name: "Tricep Pushdown", sets: 3, reps: "12-15", completed: false }
          ],
          duration: "45 minutes",
          calories: 320,
          completed: true
        },
        {
          day: "Tuesday",
          workout: "Back & Biceps",
          exercises: [
            { name: "Pull-ups", sets: 3, reps: "8-12", completed: false },
            { name: "Bent-over Rows", sets: 3, reps: "10-12", completed: false },
            { name: "Bicep Curls", sets: 3, reps: "12-15", completed: false }
          ],
          duration: "50 minutes",
          calories: 280,
          completed: false
        },
        {
          day: "Wednesday",
          workout: "Legs & Core",
          exercises: [
            { name: "Squats", sets: 4, reps: "8-10", completed: false },
            { name: "Leg Press", sets: 3, reps: "10-12", completed: false },
            { name: "Plank", sets: 3, reps: "30-60s", completed: false }
          ],
          duration: "55 minutes",
          calories: 380,
          completed: false
        },
        {
          day: "Thursday",
          workout: "Rest Day",
          exercises: [],
          duration: "0 minutes",
          calories: 0,
          completed: true
        },
        {
          day: "Friday",
          workout: "Full Body HIIT",
          exercises: [
            { name: "Burpees", sets: 4, reps: "15-20", completed: false },
            { name: "Kettlebell Swings", sets: 3, reps: "20-25", completed: false },
            { name: "Mountain Climbers", sets: 3, reps: "30-40", completed: false }
          ],
          duration: "30 minutes",
          calories: 350,
          completed: false
        },
        {
          day: "Saturday",
          workout: "Cardio & Core",
          exercises: [
            { name: "Running", sets: 1, reps: "20 min", completed: false },
            { name: "Russian Twists", sets: 3, reps: "15-20", completed: false },
            { name: "Leg Raises", sets: 3, reps: "12-15", completed: false }
          ],
          duration: "40 minutes",
          calories: 300,
          completed: false
        },
        {
          day: "Sunday",
          workout: "Active Recovery",
          exercises: [
            { name: "Yoga", sets: 1, reps: "30 min", completed: false },
            { name: "Stretching", sets: 1, reps: "15 min", completed: false }
          ],
          duration: "45 minutes",
          calories: 180,
          completed: false
        }
      ],
      completionRate: 28,
      nextWorkout: "Back & Biceps"
    };

    setWeeklyPlan(mockPlan);
  }, []);

  const markWorkoutComplete = (dayIndex) => {
    const updatedPlan = { ...weeklyPlan };
    updatedPlan.weeklySchedule[dayIndex].completed = true;
    setWeeklyPlan(updatedPlan);
  };

  return (
    <div className="my-plan-container">
      <div className="plan-header">
        <h1>My Workout Plan</h1>
        <p>Your personalized training schedule for optimal results</p>
      </div>

      <div className="plan-overview">
        <div className="overview-card">
          <h3>Program Overview</h3>
          <div className="overview-details">
            <div className="detail-item">
              <span className="label">Current Program:</span>
              <span className="value">{weeklyPlan.currentProgram}</span>
            </div>
            <div className="detail-item">
              <span className="label">Fitness Goal:</span>
              <span className="value">{weeklyPlan.fitnessGoal}</span>
            </div>
            <div className="detail-item">
              <span className="label">Completion Rate:</span>
              <span className="value">{weeklyPlan.completionRate}%</span>
            </div>
            <div className="detail-item">
              <span className="label">Next Workout:</span>
              <span className="value">{weeklyPlan.nextWorkout}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="weekly-schedule-section">
        <h2>Weekly Schedule</h2>
        <div className="week-navigation">
          <button className="nav-btn">← Previous Week</button>
          <span className="current-week">Week {currentWeek}</span>
          <button className="nav-btn">Next Week →</button>
        </div>

        <div className="schedule-grid">
          {weeklyPlan.weeklySchedule && weeklyPlan.weeklySchedule.map((day, index) => (
            <div key={index} className={`day-card ${day.completed ? 'completed' : ''}`}>
              <div className="day-header">
                <h3>{day.day}</h3>
                <span className={`status ${day.completed ? 'completed' : 'pending'}`}>
                  {day.completed ? '✓ Completed' : '⏳ Pending'}
                </span>
              </div>
              
              <div className="workout-info">
                <h4>{day.workout}</h4>
                <div className="workout-meta">
                  <span>⏱️ {day.duration}</span>
                  <span>🔥 {day.calories} cal</span>
                </div>
              </div>

              {day.exercises.length > 0 && (
                <div className="exercises-list">
                  <h5>Exercises:</h5>
                  {day.exercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="exercise-item">
                      <span className="exercise-name">{exercise.name}</span>
                      <span className="exercise-sets">{exercise.sets} sets × {exercise.reps}</span>
                    </div>
                  ))}
                </div>
              )}

              {!day.completed && day.exercises.length > 0 && (
                <button 
                  className="complete-btn"
                  onClick={() => markWorkoutComplete(index)}
                >
                  Mark as Complete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="plan-actions">
        <Link to="/workouts" className="back-link">← Back to Workouts</Link>
        <button className="print-btn">Print Plan</button>
      </div>
    </div>
  );
};

export default MyPlan;