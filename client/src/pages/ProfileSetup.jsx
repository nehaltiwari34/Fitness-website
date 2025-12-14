import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import '../css/ProfileSetup.css';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitnessLevel: 'beginner',
    goals: 'Weight loss',
    activityLevel: 'moderate'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    calculatePreviewData();
  }, [formData]);

  const calculatePreviewData = () => {
    if (!formData.age || !formData.height || !formData.weight) return;
    const age = parseInt(formData.age);
    const height = parseInt(formData.height);
    const weight = parseInt(formData.weight);
    const gender = formData.gender;
    const activityLevel = formData.activityLevel;
    const goals = formData.goals;

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    let dailyCalories = tdee;
    if (goals === 'Weight loss') dailyCalories = tdee - 500;
    if (goals === 'Muscle gain') dailyCalories = tdee + 300;

    const protein = Math.round(weight * (goals === 'Muscle gain' ? 2.2 : 1.8));
    const fat = Math.round((dailyCalories * 0.25) / 9);
    const carbs = Math.round((dailyCalories * 0.45) / 4);

    const waterGoal = Math.round(weight * 0.033 * 1000);

    const stepGoals = {
      beginner: 8000,
      intermediate: 10000,
      advanced: 12000
    };

    setPreviewData({
      bmi: bmi.toFixed(1),
      bmiCategory: getBMICategory(bmi),
      dailyCalories: Math.round(dailyCalories),
      protein,
      carbs,
      fat,
      waterGoal,
      stepGoal: stepGoals[formData.fitnessLevel] || 10000,
      workoutGoal: 16,
      maxHeartRate: 220 - age,
      fatBurnZone: `${Math.round((220 - age) * 0.6)}-${Math.round((220 - age) * 0.7)}`,
      cardioZone: `${Math.round((220 - age) * 0.7)}-${Math.round((220 - age) * 0.85)}`
    });
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Required field validation
  const isValid = () =>
    formData.age &&
    formData.gender &&
    formData.height &&
    formData.weight &&
    formData.fitnessLevel &&
    formData.goals &&
    formData.activityLevel;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('🚀 Profile setup started with data:', formData);
    
    if (!isValid()) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }
    
    try {
      console.log('📡 Sending profile data to server...');
      
      const response = await api.put('/profile/journey', formData);
      
      console.log('✅ Server response received:', response.data);
      
      if (response.data.success && response.data.user) {
        // Save the updated user data
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log('✅ Profile saved successfully!');
        console.log('✅ Updated user:', updatedUser);
        
        // Update auth context
        if (updateProfile) {
          await updateProfile(updatedUser);
        }
        
        // Wait a moment then redirect
        setTimeout(() => {
          console.log('✅ Redirecting to dashboard...');
          navigate('/dashboard', { replace: true });
        }, 500);
        
      } else {
        const errorMsg = response.data.message || 'Profile setup failed';
        setError(errorMsg);
        console.error('❌ Server error:', errorMsg);
      }
    } catch (err) {
      console.error('❌ Profile setup error:', err);
      console.error('❌ Error response:', err.response?.data);
      
      let errorMessage = 'Error saving profile. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => (currentStep / 3) * 100;

  const getStepIcon = (step) => {
    switch (step) {
      case 1: return '👤';
      case 2: return '🎯';
      case 3: return '📊';
      default: return '✅';
    }
  };

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-card">
        <div className="setup-header">
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
          <div className="step-indicators">
            {[1, 2, 3].map(step => (
              <div key={step} className={`step-indicator ${currentStep >= step ? 'active' : ''}`}>
                <span className="step-description">{getStepIcon(step)}</span>
                <span className="step-icon">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="profile-header">
          <h1>
            Welcome to FitTrack,
            {user && user.name ? ` ${user.name}` : ' User'}! 🎉
          </h1>
          <p>Let's personalize your fitness journey</p>
        </div>
        {error && (
          <div className="auth-error">
            <span>⚠️</span>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="profile-form">
          {currentStep === 1 && (
            <div className="form-step">
              <h2>👤 Basic Information</h2>
              <p>Tell us about yourself to get started</p>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="13"
                    max="100"
                    placeholder="Your age"
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    required
                    min="100"
                    max="250"
                    placeholder="Height in cm"
                  />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    min="30"
                    max="300"
                    placeholder="Weight in kg"
                  />
                </div>
              </div>
              {previewData && (
                <div className="preview-card">
                  <h3>📊 Your Health Snapshot</h3>
                  <div className="preview-metrics">
                    <div className="preview-metric">
                      <span className="metric-value">{previewData.bmi}</span>
                      <span className="metric-label">BMI</span>
                      <span className="metric-category">{previewData.bmiCategory}</span>
                    </div>
                    <div className="preview-metric">
                      <span className="metric-value">{previewData.maxHeartRate}</span>
                      <span className="metric-label">Max HR</span>
                      <span className="metric-category">BPM</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {currentStep === 2 && (
            <div className="form-step">
              <h2>🎯 Fitness Goals</h2>
              <p>What do you want to achieve?</p>
              <div className="form-group">
                <label>Fitness Level</label>
                <div className="option-grid">
                  <label className="option-card">
                    <input
                      type="radio"
                      name="fitnessLevel"
                      value="beginner"
                      checked={formData.fitnessLevel === 'beginner'}
                      onChange={handleChange}
                    />
                    <div className="option-content">
                      <span className="option-icon">🚶‍♂️</span>
                      <span className="option-title">Beginner</span>
                      <span className="option-desc">New to fitness</span>
                    </div>
                  </label>
                  <label className="option-card">
                    <input
                      type="radio"
                      name="fitnessLevel"
                      value="intermediate"
                      checked={formData.fitnessLevel === 'intermediate'}
                      onChange={handleChange}
                    />
                    <div className="option-content">
                      <span className="option-icon">🏃‍♂️</span>
                      <span className="option-title">Intermediate</span>
                      <span className="option-desc">Some experience</span>
                    </div>
                  </label>
                  <label className="option-card">
                    <input
                      type="radio"
                      name="fitnessLevel"
                      value="advanced"
                      checked={formData.fitnessLevel === 'advanced'}
                      onChange={handleChange}
                    />
                    <div className="option-content">
                      <span className="option-icon">💪</span>
                      <span className="option-title">Advanced</span>
                      <span className="option-desc">Regular exerciser</span>
                    </div>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Primary Goal</label>
                <div className="option-grid">
                  <label className="option-card">
                    <input
                      type="radio"
                      name="goals"
                      value="Weight loss"
                      checked={formData.goals === 'Weight loss'}
                      onChange={handleChange}
                    />
                    <div className="option-content">
                      <span className="option-icon">⚖️</span>
                      <span className="option-title">Weight Loss</span>
                      <span className="option-desc">Shed extra pounds</span>
                    </div>
                  </label>
                  <label className="option-card">
                    <input
                      type="radio"
                      name="goals"
                      value="Muscle gain"
                      checked={formData.goals === 'Muscle gain'}
                      onChange={handleChange}
                    />
                    <div className="option-content">
                      <span className="option-icon">💪</span>
                      <span className="option-title">Muscle Gain</span>
                      <span className="option-desc">Build strength</span>
                    </div>
                  </label>
                  <label className="option-card">
                    <input
                      type="radio"
                      name="goals"
                      value="General fitness"
                      checked={formData.goals === 'General fitness'}
                      onChange={handleChange}
                    />
                    <div className="option-content">
                      <span className="option-icon">❤️</span>
                      <span className="option-title">General Fitness</span>
                      <span className="option-desc">Stay healthy</span>
                    </div>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Activity Level</label>
                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} required>
                  <option value="sedentary">Sedentary (little to no exercise)</option>
                  <option value="light">Light (light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                  <option value="active">Active (hard exercise 6-7 days/week)</option>
                  <option value="very_active">Very Active (physical job + daily exercise)</option>
                </select>
              </div>
            </div>
          )}
          {currentStep === 3 && previewData && (
            <div className="form-step">
              <h2>📊 Your Personalized Plan</h2>
              <p>Based on your profile, here's your customized fitness plan</p>
              <div className="plan-preview">
                <div className="plan-section">
                  <h3>🎯 Daily Targets</h3>
                  <div className="targets-grid">
                    <div className="target-card">
                      <span className="target-icon">🔥</span>
                      <div className="target-info">
                        <span className="target-value">{previewData.dailyCalories}</span>
                        <span className="target-label">Calories</span>
                      </div>
                    </div>
                    <div className="target-card">
                      <span className="target-icon">💧</span>
                      <div className="target-info">
                        <span className="target-value">{(previewData.waterGoal / 1000).toFixed(1)}L</span>
                        <span className="target-label">Water</span>
                      </div>
                    </div>
                    <div className="target-card">
                      <span className="target-icon">👣</span>
                      <div className="target-info">
                        <span className="target-value">{previewData.stepGoal.toLocaleString()}</span>
                        <span className="target-label">Steps</span>
                      </div>
                    </div>
                    <div className="target-card">
                      <span className="target-icon">💪</span>
                      <div className="target-info">
                        <span className="target-value">{previewData.workoutGoal}</span>
                        <span className="target-label">Workouts/Month</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="plan-section">
                  <h3>🍽️ Nutrition Goals</h3>
                  <div className="macros-grid">
                    <div className="macro-card protein">
                      <span className="macro-value">{previewData.protein}g</span>
                      <span className="macro-label">Protein</span>
                    </div>
                    <div className="macro-card carbs">
                      <span className="macro-value">{previewData.carbs}g</span>
                      <span className="macro-label">Carbs</span>
                    </div>
                    <div className="macro-card fat">
                      <span className="macro-value">{previewData.fat}g</span>
                      <span className="macro-label">Fat</span>
                    </div>
                  </div>
                </div>
                <div className="plan-section">
                  <h3>❤️ Heart Rate Zones</h3>
                  <div className="zones-grid">
                    <div className="zone-card">
                      <span className="zone-icon">🟡</span>
                      <div className="zone-info">
                        <span className="zone-value">{previewData.fatBurnZone}</span>
                        <span className="zone-label">Fat Burn Zone</span>
                      </div>
                    </div>
                    <div className="zone-card">
                      <span className="zone-icon">🔴</span>
                      <div className="zone-info">
                        <span className="zone-value">{previewData.cardioZone}</span>
                        <span className="zone-label">Cardio Zone</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ai-notice">
                <p>🤖 Powered by AI - Your personalized fitness plan will adapt as you progress</p>
              </div>
            </div>
          )}
          <div className="form-navigation">
            {currentStep > 1 && (
              <button type="button" onClick={handleBack} className="btn btn-secondary">
                ← Back
              </button>
            )}
            {currentStep < 3 ? (
              <button type="button" onClick={handleNext} className="btn btn-primary">
                Next →
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Creating Your Plan...' : '🎯 Start My Journey!'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
