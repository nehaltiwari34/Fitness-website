import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import '../css/CreatePlan.css';

const CreatePlan = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        goal: 'General Fitness',
        difficulty: 'Beginner',
        duration: 4,
        weeklySchedule: []
    });
    const [loading, setLoading] = useState(false);

    const goals = ['Weight Loss', 'Muscle Gain', 'Endurance', 'General Fitness', 'Strength', 'Flexibility'];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/workouts/plans', formData);
            if (response.data.success) {
                alert('Workout plan created successfully!');
                navigate('/my-plan');
            }
        } catch (error) {
            console.error('Error creating workout plan:', error);
            alert('Failed to create workout plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="create-plan-container">
            <div className="create-plan-header">
                <h1>Create Workout Plan</h1>
                <p>Design your personalized fitness journey</p>
            </div>

            <form onSubmit={handleSubmit} className="plan-form">
                <div className="form-section">
                    <h2>Plan Details</h2>
                    
                    <div className="form-group">
                        <label>Plan Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="e.g., 4-Week Strength Program"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe your workout plan goals and focus..."
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Primary Goal</label>
                            <select
                                value={formData.goal}
                                onChange={(e) => handleInputChange('goal', e.target.value)}
                            >
                                {goals.map(goal => (
                                    <option key={goal} value={goal}>{goal}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Difficulty Level</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                            >
                                {difficulties.map(difficulty => (
                                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Duration (weeks)</label>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={formData.duration}
                                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn-outline"
                        onClick={() => navigate('/my-plan')}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading || !formData.name.trim()}
                    >
                        {loading ? 'Creating Plan...' : 'Create Workout Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePlan;