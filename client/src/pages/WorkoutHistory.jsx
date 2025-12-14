import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import '../css/WorkoutHistory.css';

const WorkoutHistory = () => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchWorkoutHistory();
    }, [currentPage]);

    const fetchWorkoutHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/workouts/sessions/history?page=${currentPage}&limit=10`);
            if (response.data.success) {
                setWorkouts(response.data.workouts);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.error('Error fetching workout history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="workout-history-container">
                <div className="loading-spinner-large"></div>
                <p>Loading your workout history...</p>
            </div>
        );
    }

    return (
        <div className="workout-history-container">
            <div className="workout-history-header">
                <h1>Workout History</h1>
                <p>Track your fitness journey and progress over time</p>
            </div>

            <div className="workouts-list">
                {workouts.length > 0 ? (
                    workouts.map(workout => (
                        <div key={workout._id} className="workout-history-card">
                            <div className="workout-info">
                                <h3>{workout.name}</h3>
                                <div className="workout-details">
                                    <span>⏱️ {workout.duration} minutes</span>
                                    <span>🔥 {workout.caloriesBurned} calories</span>
                                    <span>⭐ {workout.rating || 'No rating'}</span>
                                </div>
                                <div className="workout-date">
                                    {new Date(workout.completedAt).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                                {workout.notes && (
                                    <div className="workout-notes">
                                        <strong>Notes:</strong> {workout.notes}
                                    </div>
                                )}
                            </div>
                            <div className="workout-actions">
                                <button className="btn-outline">View Details</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-workouts">
                        <div className="no-workouts-icon">💪</div>
                        <h3>No Workouts Yet</h3>
                        <p>Start your fitness journey by completing your first workout!</p>
                        <Link to="/workouts" className="btn-primary">
                            Start Workout
                        </Link>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorkoutHistory;