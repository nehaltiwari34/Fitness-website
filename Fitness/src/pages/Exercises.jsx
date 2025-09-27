import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Exercises.css';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockExercises = [
      {
        id: 1,
        name: "Bench Press",
        category: "Chest",
        equipment: "Barbell",
        difficulty: "Intermediate",
        instructions: [
          "Lie flat on bench with feet on floor",
          "Grip bar slightly wider than shoulder width",
          "Lower bar to chest, then press back up"
        ],
        videoUrl: "#",
        muscleGroups: ["Pectorals", "Triceps", "Shoulders"]
      },
      {
        id: 2,
        name: "Squats",
        category: "Legs",
        equipment: "Barbell",
        difficulty: "Beginner",
        instructions: [
          "Stand with feet shoulder-width apart",
          "Keep chest up and back straight",
          "Lower hips until thighs parallel to floor"
        ],
        videoUrl: "#",
        muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"]
      },
      {
        id: 3,
        name: "Deadlifts",
        category: "Back",
        equipment: "Barbell",
        difficulty: "Advanced",
        instructions: [
          "Stand with feet hip-width apart",
          "Bend at hips and knees to grip bar",
          "Lift bar by extending hips and knees"
        ],
        videoUrl: "#",
        muscleGroups: ["Back", "Glutes", "Hamstrings"]
      },
      {
        id: 4,
        name: "Pull-ups",
        category: "Back",
        equipment: "Bodyweight",
        difficulty: "Intermediate",
        instructions: [
          "Grip bar with palms facing away",
          "Hang with arms fully extended",
          "Pull body up until chin clears bar"
        ],
        videoUrl: "#",
        muscleGroups: ["Latissimus Dorsi", "Biceps"]
      },
      {
        id: 5,
        name: "Push-ups",
        category: "Chest",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        instructions: [
          "Start in plank position",
          "Lower body until chest nearly touches floor",
          "Push back up to starting position"
        ],
        videoUrl: "#",
        muscleGroups: ["Pectorals", "Triceps", "Shoulders"]
      },
      {
        id: 6,
        name: "Lunges",
        category: "Legs",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        instructions: [
          "Stand with feet together",
          "Step forward with one leg",
          "Lower hips until both knees bent at 90°"
        ],
        videoUrl: "#",
        muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"]
      }
    ];

    setExercises(mockExercises);
    setFilteredExercises(mockExercises);
  }, []);

  useEffect(() => {
    let filtered = exercises;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredExercises(filtered);
  }, [selectedCategory, searchTerm, exercises]);

  return (
    <div className="exercises-container">
      <div className="exercises-header">
        <h1>Exercise Library</h1>
        <p>Browse our comprehensive collection of 500+ exercises with video demonstrations</p>
        <Link to="/workouts" className="back-link">← Back to Workouts</Link>
      </div>

      <div className="exercises-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="exercises-grid">
        {filteredExercises.map(exercise => (
          <div key={exercise.id} className="exercise-card">
            <div className="exercise-header">
              <h3>{exercise.name}</h3>
              <span className={`difficulty-badge ${exercise.difficulty.toLowerCase()}`}>
                {exercise.difficulty}
              </span>
            </div>
            
            <div className="exercise-meta">
              <span className="category">{exercise.category}</span>
              <span className="equipment">{exercise.equipment}</span>
            </div>

            <div className="muscle-groups">
              <strong>Targets:</strong> {exercise.muscleGroups.join(', ')}
            </div>

            <div className="instructions">
              <h4>Instructions:</h4>
              <ol>
                {exercise.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            <div className="exercise-actions">
              <button className="video-btn">Watch Video</button>
              <button className="add-btn">Add to Workout</button>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="no-results">
          <p>No exercises found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Exercises;