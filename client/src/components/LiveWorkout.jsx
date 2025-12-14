import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import '../css/LiveWorkout.css';

const LiveWorkout = () => {
    const { workoutId } = useParams();
    const { socket, isConnected } = useSocket();
    const [workout, setWorkout] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [completedExercises, setCompletedExercises] = useState([]);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchWorkout();
        
        if (socket && workoutId) {
            socket.emit('joinWorkout', workoutId);
            
            socket.on('workoutProgressUpdate', (data) => {
                // Handle real-time updates from other users
                console.log('Real-time update:', data);
            });
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (socket) {
                socket.off('workoutProgressUpdate');
            }
        };
    }, [socket, workoutId]);

    const fetchWorkout = async () => {
        try {
            const response = await api.get(`/workouts/sessions/${workoutId}`);
            if (response.data.success) {
                setWorkout(response.data.workoutSession);
            }
        } catch (error) {
            console.error('Error fetching workout:', error);
        }
    };

    const startTimer = () => {
        setIsActive(true);
        timerRef.current = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
    };

    const pauseTimer = () => {
        setIsActive(false);
        clearInterval(timerRef.current);
    };

    const completeExercise = async (exerciseIndex) => {
        const updatedExercises = [...workout.exercises];
        updatedExercises[exerciseIndex].completed = true;
        
        setWorkout(prev => ({
            ...prev,
            exercises: updatedExercises
        }));

        setCompletedExercises(prev => [...prev, exerciseIndex]);

        // Emit real-time update
        if (socket) {
            socket.emit('workoutProgress', {
                workoutId,
                exerciseIndex,
                type: 'exerciseCompleted'
            });
        }
    };

    const completeWorkout = async () => {
        try {
            const totalDuration = Math.floor(timer / 60); // Convert to minutes
            const estimatedCalories = Math.floor(totalDuration * 8); // Rough estimate
            
            const response = await api.post('/workouts/sessions/complete', {
                sessionId: workoutId,
                duration: totalDuration,
                caloriesBurned: estimatedCalories,
                exercises: workout.exercises
            });

            if (response.data.success) {
                // Emit workout completion
                if (socket) {
                    socket.emit('workoutCompleted', {
                        userId: workout.userId,
                        workoutId,
                        duration: totalDuration,
                        calories: estimatedCalories
                    });
                }

                alert('🎉 Workout completed successfully!');
                // Redirect to workout history or dashboard
            }
        } catch (error) {
            console.error('Error completing workout:', error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!workout) {
        return <div>Loading workout...</div>;
    }

    const currentExercise = workout.exercises[currentExerciseIndex];

    return (
        <div className="live-workout-container">
            {/* Workout Header */}
            <div className="workout-header-live">
                <h1>{workout.name}</h1>
                <div className="workout-timer">
                    <span className="timer-display">{formatTime(timer)}</span>
                    <div className="timer-controls">
                        {!isActive ? (
                            <button onClick={startTimer} className="btn-primary">
                                Start
                            </button>
                        ) : (
                            <button onClick={pauseTimer} className="btn-outline">
                                Pause
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="workout-progress">
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ 
                            width: `${((currentExerciseIndex + 1) / workout.exercises.length) * 100}%` 
                        }}
                    ></div>
                </div>
                <span>
                    Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
                </span>
            </div>

            {/* Current Exercise */}
            <div className="current-exercise">
                <h2>{currentExercise.exercise.name}</h2>
                
                {currentExercise.exercise.videoUrl && (
                    <div className="exercise-video">
                        <iframe
                            src={currentExercise.exercise.videoUrl.replace('watch?v=', 'embed/')}
                            title={currentExercise.exercise.name}
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                <div className="exercise-details">
                    <div className="detail-item">
                        <strong>Sets:</strong> {currentExercise.exercise.sets}
                    </div>
                    <div className="detail-item">
                        <strong>Reps:</strong> {currentExercise.exercise.reps}
                    </div>
                    {currentExercise.exercise.duration && (
                        <div className="detail-item">
                            <strong>Duration:</strong> {currentExercise.exercise.duration}s
                        </div>
                    )}
                </div>

                {currentExercise.exercise.instructions && (
                    <div className="exercise-instructions">
                        <h4>Instructions:</h4>
                        <ol>
                            {currentExercise.exercise.instructions.map((instruction, index) => (
                                <li key={index}>{instruction}</li>
                            ))}
                        </ol>
                    </div>
                )}

                <div className="exercise-actions">
                    <button 
                        onClick={() => completeExercise(currentExerciseIndex)}
                        className="btn-primary large"
                    >
                        Complete Exercise
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="workout-navigation">
                <button 
                    onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentExerciseIndex === 0}
                    className="btn-outline"
                >
                    Previous
                </button>
                
                <button 
                    onClick={() => setCurrentExerciseIndex(prev => 
                        Math.min(workout.exercises.length - 1, prev + 1)
                    )}
                    disabled={currentExerciseIndex === workout.exercises.length - 1}
                    className="btn-primary"
                >
                    Next Exercise
                </button>
            </div>

            {/* Complete Workout */}
            {completedExercises.length === workout.exercises.length && (
                <div className="workout-completion">
                    <h3>🎉 All Exercises Completed!</h3>
                    <button onClick={completeWorkout} className="btn-primary large">
                        Finish Workout
                    </button>
                </div>
            )}

            {/* Real-time Status */}
            <div className="real-time-status">
                <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? '🔌 Live' : '🔴 Offline'}
                </span>
                <span>Real-time updates {isConnected ? 'active' : 'paused'}</span>
            </div>
        </div>
    );
};

export default LiveWorkout; 