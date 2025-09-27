import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CreateWorkout = () => {
  const [workoutData, setWorkoutData] = useState({
    title: '',
    description: '',
    duration: '',
    difficulty: 'Beginner'
  })
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Workout "${workoutData.title}" created successfully!`)
    navigate('/workouts')
  }

  const handleChange = (e) => {
    setWorkoutData({
      ...workoutData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="create-workout-page">
      <div className="page-header">
        <h1>Create New Workout</h1>
        <button className="secondary-btn" onClick={() => navigate('/workouts')}>
          Back to Workouts
        </button>
      </div>

      <form onSubmit={handleSubmit} className="workout-form">
        <div className="form-group">
          <label>Workout Title</label>
          <input
            type="text"
            name="title"
            value={workoutData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Full Body Strength"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={workoutData.description}
            onChange={handleChange}
            placeholder="Describe your workout routine"
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={workoutData.duration}
              onChange={handleChange}
              required
              min="5"
              max="120"
            />
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <select
              name="difficulty"
              value={workoutData.difficulty}
              onChange={handleChange}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-btn">
            Create Workout
          </button>
          <button type="button" className="secondary-btn" onClick={() => navigate('/workouts')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateWorkout