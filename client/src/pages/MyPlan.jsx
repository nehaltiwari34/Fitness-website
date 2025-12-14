import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import '../css/MyPlan.css';

const MyPlan = () => {
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchPlanData();
    }
  }, [user, currentWeek]);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      const userData = response.data.user;
      
      const transformedData = transformPlanData(userData);
      setWeeklyPlan(transformedData);
    } catch (error) {
      console.error('Error fetching plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformPlanData = (userData) => {
    const fitnessPlan = userData.fitnessPlan || {};
    const profile = userData.profile || {};
    const dailyProgress = userData.dailyProgress || {};

    const weeklySchedule = fitnessPlan.weeklySchedule || getDefaultWeeklySchedule(profile);
    const completedWorkouts = weeklySchedule.filter(day => day.completed).length;
    const completionRate = Math.round((completedWorkouts / weeklySchedule.length) * 100);

    return {
      userName: userData.name || "User",
      fitnessGoal: profile.goals || "General fitness",
      currentProgram: `${profile.fitnessLevel || 'Beginner'} ${profile.goals || 'Fitness'} Program`,
      weeklySchedule: weeklySchedule,
      completionRate: completionRate,
      nextWorkout: weeklySchedule.find(day => !day.completed && day.workoutType !== 'Rest Day')?.workoutType || 'Rest Day'
    };
  };

  const getDefaultWeeklySchedule = (profile) => {
    // Same function as in Workouts.jsx
    return [
      { day: "Monday", workoutType: "Upper Body Strength", completed: false, duration: 45, caloriesBurned: 280 },
      { day: "Tuesday", workoutType: "Cardio & Core", completed: false, duration: 30, caloriesBurned: 250 },
      { day: "Wednesday", workoutType: "Active Recovery", completed: false, duration: 20, caloriesBurned: 120 },
      { day: "Thursday", workoutType: "Lower Body Strength", completed: false, duration: 50, caloriesBurned: 320 },
      { day: "Friday", workoutType: "HIIT Circuit", completed: false, duration: 25, caloriesBurned: 300 },
      { day: "Saturday", workoutType: "Cardio Endurance", completed: false, duration: 40, caloriesBurned: 280 },
      { day: "Sunday", workoutType: "Rest Day", completed: true, duration: 0, caloriesBurned: 0 }
    ];
  };

  const markWorkoutComplete = async (dayIndex) => {
    try {
      const day = weeklyPlan.weeklySchedule[dayIndex];
      if (day && day.workoutType !== 'Rest Day') {
        await api.post('/profile/progress', {
          workoutsCompleted: 1,
          caloriesBurned: day.caloriesBurned || 250
        });
        
        alert(`Great! ${day.workoutType} marked as completed. 🎉`);
        fetchPlanData(); // Refresh data
      } else if (day?.workoutType === 'Rest Day') {
        alert('Rest day is automatically completed! 🛌');
      }
    } catch (error) {
      console.error('Error marking workout complete:', error);
      alert('Error completing workout. Please try again.');
    }
  };

  const handleWeekNavigation = (direction) => {
    if (direction === 'next' && currentWeek < 4) {
      setCurrentWeek(currentWeek + 1);
    } else if (direction === 'prev' && currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  if (loading || !weeklyPlan) {
    return (
      <div className="my-plan-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your workout plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-plan-container">
      <div className="plan-header">
        <h1>My Workout Plan</h1>
        <p>Your personalized training schedule for optimal results - Week {currentWeek}</p>
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
        <h2>Weekly Schedule - Week {currentWeek}</h2>
        <div className="week-navigation">
          <button 
            className="nav-btn"
            onClick={() => handleWeekNavigation('prev')}
            disabled={currentWeek === 1}
          >
            ← Previous Week
          </button>
          <span className="current-week">Week {currentWeek}</span>
          <button 
            className="nav-btn"
            onClick={() => handleWeekNavigation('next')}
            disabled={currentWeek === 4}
          >
            Next Week →
          </button>
        </div>

        <div className="schedule-grid">
          {weeklyPlan.weeklySchedule.map((day, index) => (
            <div key={index} className={`day-card ${day.completed ? 'completed' : ''} ${day.workoutType === 'Rest Day' ? 'rest-day' : ''}`}>
              <div className="day-header">
                <h3>{day.day}</h3>
                <span className={`status ${day.completed ? 'completed' : 'pending'}`}>
                  {day.completed ? '✓ Completed' : (day.workoutType === 'Rest Day' ? '🛌 Rest Day' : '⏳ Pending')}
                </span>
              </div>
              
              <div className="workout-info">
                <h4>{day.workoutType}</h4>
                <div className="workout-meta">
                  <span>⏱️ {day.duration} minutes</span>
                  <span>🔥 {day.caloriesBurned} cal</span>
                </div>
              </div>

              {day.workoutType !== 'Rest Day' && (
                <div className="workout-actions">
                  {!day.completed ? (
                    <button 
                      className="complete-btn"
                      onClick={() => markWorkoutComplete(index)}
                    >
                      Mark as Complete
                    </button>
                  ) : (
                    <span className="completed-text">Well done! ✅</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="plan-actions">
        <Link to="/workouts" className="back-link">← Back to Workouts</Link>
        <button 
          className="print-btn"
          onClick={() => window.print()}
        >
          Print Plan
        </button>
      </div>
    </div>
  );
};

export default MyPlan;