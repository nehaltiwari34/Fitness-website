import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Programs.css';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState('All');

  const goals = ['All', 'Weight Loss', 'Muscle Gain', 'Endurance', 'Beginner'];

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockPrograms = [
      {
        id: 1,
        name: "4-Week Fat Loss",
        duration: "4 weeks",
        difficulty: "Intermediate",
        goal: "Weight Loss",
        description: "High-intensity interval training program designed to maximize fat burn while preserving muscle mass.",
        focus: ["HIIT", "Cardio", "Nutrition"],
        workoutsPerWeek: 5,
        durationPerWorkout: "45-60 minutes",
        equipment: ["Dumbbells", "Resistance Bands"],
        image: "/images/fat-loss.jpg"
      },
      {
        id: 2,
        name: "Beginner Strength",
        duration: "8 weeks",
        difficulty: "Beginner",
        goal: "Muscle Gain",
        description: "Perfect for those new to weight training. Focus on proper form and foundational movements.",
        focus: ["Form", "Progressive Overload", "Full Body"],
        workoutsPerWeek: 3,
        durationPerWorkout: "45 minutes",
        equipment: ["Bodyweight", "Dumbbells"],
        image: "/images/beginner-strength.jpg"
      },
      {
        id: 3,
        name: "Marathon Training",
        duration: "16 weeks",
        difficulty: "Advanced",
        goal: "Endurance",
        description: "Comprehensive running program designed to prepare you for marathon distance.",
        focus: ["Running", "Endurance", "Recovery"],
        workoutsPerWeek: 6,
        durationPerWorkout: "30-120 minutes",
        equipment: ["Running Shoes"],
        image: "/images/marathon.jpg"
      },
      {
        id: 4,
        name: "Bodyweight Mastery",
        duration: "6 weeks",
        difficulty: "Intermediate",
        goal: "Muscle Gain",
        description: "Build strength and muscle using only your bodyweight. Perfect for home workouts.",
        focus: ["Calisthenics", "Mobility", "Core Strength"],
        workoutsPerWeek: 4,
        durationPerWorkout: "40 minutes",
        equipment: ["Bodyweight"],
        image: "/images/bodyweight.jpg"
      },
      {
        id: 5,
        name: "Yoga Foundation",
        duration: "4 weeks",
        difficulty: "Beginner",
        goal: "Flexibility",
        description: "Develop flexibility, balance, and mindfulness through structured yoga practice.",
        focus: ["Flexibility", "Balance", "Mindfulness"],
        workoutsPerWeek: 5,
        durationPerWorkout: "30 minutes",
        equipment: ["Yoga Mat"],
        image: "/images/yoga.jpg"
      },
      {
        id: 6,
        name: "Powerlifting Program",
        duration: "12 weeks",
        difficulty: "Advanced",
        goal: "Muscle Gain",
        description: "Focus on increasing your strength in squat, bench press, and deadlift.",
        focus: ["Strength", "Power", "Recovery"],
        workoutsPerWeek: 4,
        durationPerWorkout: "90 minutes",
        equipment: ["Barbell", "Power Rack"],
        image: "/images/powerlifting.jpg"
      }
    ];

    setPrograms(mockPrograms);
  }, []);

  const filteredPrograms = selectedGoal === 'All' 
    ? programs 
    : programs.filter(program => program.goal === selectedGoal);

  return (
    <div className="programs-container">
      <div className="programs-header">
        <h1>Training Programs</h1>
        <p>Structured workout programs designed by certified fitness experts</p>
        <Link to="/workouts" className="back-link">← Back to Workouts</Link>
      </div>

      <div className="programs-controls">
        <div className="goal-filters">
          {goals.map(goal => (
            <button
              key={goal}
              className={`goal-btn ${selectedGoal === goal ? 'active' : ''}`}
              onClick={() => setSelectedGoal(goal)}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <div className="programs-grid">
        {filteredPrograms.map(program => (
          <div key={program.id} className="program-card">
            <div className="program-image">
              {/* Placeholder for program image */}
              <div className="image-placeholder">{program.name.charAt(0)}</div>
            </div>
            
            <div className="program-content">
              <div className="program-header">
                <h3>{program.name}</h3>
                <span className={`difficulty-badge ${program.difficulty.toLowerCase()}`}>
                  {program.difficulty}
                </span>
              </div>
              
              <div className="program-meta">
                <span>⏱️ {program.duration}</span>
                <span>🎯 {program.goal}</span>
                <span>💪 {program.workoutsPerWeek}/week</span>
              </div>

              <p className="program-description">{program.description}</p>

              <div className="program-focus">
                <strong>Focus Areas:</strong>
                <div className="focus-tags">
                  {program.focus.map((focus, index) => (
                    <span key={index} className="focus-tag">{focus}</span>
                  ))}
                </div>
              </div>

              <div className="program-equipment">
                <strong>Equipment Needed:</strong> {program.equipment.join(', ')}
              </div>

              <div className="program-actions">
                <button className="view-btn">View Program Details</button>
                <button className="start-btn">Start This Program</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="no-programs">
          <p>No programs found for the selected goal.</p>
        </div>
      )}
    </div>
  );
};

export default Programs;