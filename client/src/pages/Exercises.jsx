import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import '../css/Exercises.css';

const Exercises = () => {
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        difficulty: '',
        search: '',
        equipment: ''
    });
    const [categories] = useState([
        'Strength', 'Cardio', 'Flexibility', 'HIIT', 'Core', 'Upper Body', 'Lower Body', 'Full Body'
    ]);
    const [difficulties] = useState(['Beginner', 'Intermediate', 'Advanced']);

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        filterExercises();
    }, [exercises, filters]);

    const fetchExercises = async () => {
        try {
            setLoading(true);
            const response = await api.get('/workouts/exercises');
            if (response.data.success) {
                setExercises(response.data.exercises);
            }
        } catch (error) {
            console.error('Error fetching exercises:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterExercises = () => {
        let filtered = exercises;

        if (filters.category) {
            filtered = filtered.filter(exercise => exercise.category === filters.category);
        }
        if (filters.difficulty) {
            filtered = filtered.filter(exercise => exercise.difficulty === filters.difficulty);
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(exercise => 
                exercise.name.toLowerCase().includes(searchLower) ||
                exercise.description?.toLowerCase().includes(searchLower) ||
                exercise.targets?.some(target => target.toLowerCase().includes(searchLower))
            );
        }

        setFilteredExercises(filtered);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            difficulty: '',
            search: '',
            equipment: ''
        });
    };

    if (loading) {
        return (
            <div className="exercises-container">
                <div className="loading-spinner-large"></div>
                <p>Loading exercise library...</p>
            </div>
        );
    }

    return (
        <div className="exercises-container">
            {/* Header */}
            <div className="exercises-header">
                <h1>Exercise Library</h1>
                <p>Discover {exercises.length}+ exercises with video demonstrations</p>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>

                <div className="filter-grid">
                    <select 
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>

                    <select 
                        value={filters.difficulty}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Levels</option>
                        {difficulties.map(difficulty => (
                            <option key={difficulty} value={difficulty}>{difficulty}</option>
                        ))}
                    </select>

                    <button onClick={clearFilters} className="clear-filters-btn">
                        Clear Filters
                    </button>
                </div>

                <div className="filter-results">
                    <span>
                        Showing {filteredExercises.length} of {exercises.length} exercises
                    </span>
                </div>
            </div>

            {/* Exercises Grid */}
            <div className="exercises-grid">
                {filteredExercises.map(exercise => (
                    <ExerciseCard key={exercise._id} exercise={exercise} />
                ))}
            </div>

            {filteredExercises.length === 0 && (
                <div className="no-exercises">
                    <div className="no-exercises-icon">💪</div>
                    <h3>No exercises found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button onClick={clearFilters} className="btn-primary">
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
};

// Exercise Card Component
const ExerciseCard = ({ exercise }) => {
    const [showVideo, setShowVideo] = useState(false);

    return (
        <div className="exercise-card">
            <div className="exercise-image">
                {exercise.videoUrl ? (
                    <div className="video-thumbnail" onClick={() => setShowVideo(!showVideo)}>
                        {showVideo ? (
                            <div className="video-container">
                                <iframe
                                    src={exercise.videoUrl.replace('watch?v=', 'embed/')}
                                    title={exercise.name}
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <>
                                <div className="thumbnail-overlay">
                                    <span className="play-icon">▶️</span>
                                    <span>Click to play</span>
                                </div>
                                <img 
                                    src={exercise.imageUrl || '/assets/exercise-placeholder.jpg'} 
                                    alt={exercise.name}
                                />
                            </>
                        )}
                    </div>
                ) : (
                    <img 
                        src={exercise.imageUrl || '/assets/exercise-placeholder.jpg'} 
                        alt={exercise.name}
                    />
                )}
            </div>

            <div className="exercise-content">
                <div className="exercise-header">
                    <h3>{exercise.name}</h3>
                    <span className={`difficulty-badge ${exercise.difficulty?.toLowerCase()}`}>
                        {exercise.difficulty}
                    </span>
                </div>

                <p className="exercise-description">
                    {exercise.description || 'No description available'}
                </p>

                <div className="exercise-meta">
                    <div className="meta-item">
                        <span className="meta-label">Category:</span>
                        <span className="meta-value">{exercise.category}</span>
                    </div>
                    {exercise.sets && (
                        <div className="meta-item">
                            <span className="meta-label">Sets:</span>
                            <span className="meta-value">{exercise.sets} × {exercise.reps}</span>
                        </div>
                    )}
                    {exercise.duration && (
                        <div className="meta-item">
                            <span className="meta-label">Duration:</span>
                            <span className="meta-value">{exercise.duration}s</span>
                        </div>
                    )}
                </div>

                {exercise.targets && exercise.targets.length > 0 && (
                    <div className="exercise-targets">
                        <strong>Targets:</strong> {exercise.targets.join(', ')}
                    </div>
                )}

                {exercise.equipment && exercise.equipment.length > 0 && (
                    <div className="exercise-equipment">
                        <strong>Equipment:</strong> {exercise.equipment.join(', ')}
                    </div>
                )}

                <div className="exercise-actions">
                    <Link 
                        to={`/exercise/${exercise._id}`}
                        className="btn-primary small"
                    >
                        View Details
                    </Link>
                    <button className="btn-outline small">
                        Add to Workout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Exercises;