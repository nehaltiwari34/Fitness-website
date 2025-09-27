import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Nutrition.css';

const Nutrition = () => {
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);

    // Sample nutrition data
    const nutritionData = {
        dailyCalories: 2200,
        consumed: 1850,
        remaining: 350,
        macros: {
            protein: { consumed: 120, goal: 150 },
            carbs: { consumed: 200, goal: 250 },
            fat: { consumed: 60, goal: 70 }
        },
        meals: [
            { type: 'Breakfast', name: 'Oatmeal with fruits', calories: 350, time: '8:00 AM' },
            { type: 'Lunch', name: 'Chicken salad', calories: 450, time: '1:00 PM' },
            { type: 'Dinner', name: 'Salmon with vegetables', calories: 550, time: '7:00 PM' }
        ]
    };

    const handleLogWeight = (weightData) => {
        console.log('Logging weight:', weightData);
        // API call to save weight data
        setShowWeightModal(false);
    };

    const handleLogFood = (foodData) => {
        console.log('Logging food:', foodData);
        // API call to save food data
        setShowFoodModal(false);
    };

    const handleLogWorkout = (workoutData) => {
        console.log('Logging workout:', workoutData);
        // API call to save workout data
        setShowWorkoutModal(false);
    };

    return (
        <div className="nutrition-container">
            <div className="nutrition-header">
                <h1>Nutrition & Health</h1>
                <p>Track your meals, weight, and workouts for better health insights</p>
            </div>

            {/* Quick Actions Section */}
            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions-grid">
                    <button 
                        className="action-card"
                        onClick={() => setShowWeightModal(true)}
                    >
                        <div className="action-icon">⚖️</div>
                        <h3>LOG WEIGHT</h3>
                        <p>Track your weight progress</p>
                    </button>

                    <button 
                        className="action-card"
                        onClick={() => setShowFoodModal(true)}
                    >
                        <div className="action-icon">🍎</div>
                        <h3>LOG FOOD</h3>
                        <p>Add meals to your diary</p>
                    </button>

                    <button 
                        className="action-card"
                        onClick={() => setShowWorkoutModal(true)}
                    >
                        <div className="action-icon">💪</div>
                        <h3>LOG WORKOUT</h3>
                        <p>Record your exercise</p>
                    </button>
                </div>
            </div>

            {/* Daily Nutrition Overview */}
            <div className="nutrition-overview">
                <h2>Today's Nutrition</h2>
                <div className="calorie-tracker">
                    <div className="calorie-display">
                        <span className="calories-consumed">{nutritionData.consumed}</span>
                        <span className="calories-total">/ {nutritionData.dailyCalories} kcal</span>
                    </div>
                    <div className="calorie-progress">
                        <div 
                            className="progress-bar"
                            style={{ width: `${(nutritionData.consumed / nutritionData.dailyCalories) * 100}%` }}
                        ></div>
                    </div>
                    <div className="calories-remaining">
                        {nutritionData.remaining} kcal remaining
                    </div>
                </div>

                <div className="macros-grid">
                    <div className="macro-item">
                        <h4>Protein</h4>
                        <span>{nutritionData.macros.protein.consumed}g / {nutritionData.macros.protein.goal}g</span>
                    </div>
                    <div className="macro-item">
                        <h4>Carbs</h4>
                        <span>{nutritionData.macros.carbs.consumed}g / {nutritionData.macros.carbs.goal}g</span>
                    </div>
                    <div className="macro-item">
                        <h4>Fat</h4>
                        <span>{nutritionData.macros.fat.consumed}g / {nutritionData.macros.fat.goal}g</span>
                    </div>
                </div>
            </div>

            {/* Today's Meals */}
            <div className="meals-section">
                <div className="section-header">
                    <h2>Today's Meals</h2>
                    <Link to="/nutrition/plan" className="view-plan-btn">
                        VIEW MEAL PLAN
                    </Link>
                </div>
                
                <div className="meals-list">
                    {nutritionData.meals.map((meal, index) => (
                        <div key={index} className="meal-card">
                            <div className="meal-info">
                                <span className="meal-type">{meal.type}</span>
                                <h4>{meal.name}</h4>
                                <span className="meal-time">{meal.time}</span>
                            </div>
                            <div className="meal-calories">
                                {meal.calories} kcal
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {showWeightModal && (
                <WeightModal 
                    onClose={() => setShowWeightModal(false)}
                    onSave={handleLogWeight}
                />
            )}

            {showFoodModal && (
                <FoodModal 
                    onClose={() => setShowFoodModal(false)}
                    onSave={handleLogFood}
                />
            )}

            {showWorkoutModal && (
                <WorkoutModal 
                    onClose={() => setShowWorkoutModal(false)}
                    onSave={handleLogWorkout}
                />
            )}
        </div>
    );
};

// Weight Modal Component
const WeightModal = ({ onClose, onSave }) => {
    const [weight, setWeight] = useState('');
    const [unit, setUnit] = useState('kg');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ weight: parseFloat(weight), unit, date: new Date() });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Log Weight</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Weight</label>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Enter your weight"
                                required
                            />
                            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save Weight
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Food Modal Component
const FoodModal = ({ onClose, onSave }) => {
    const [food, setFood] = useState('');
    const [calories, setCalories] = useState('');
    const [mealType, setMealType] = useState('Breakfast');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            food, 
            calories: parseInt(calories), 
            mealType,
            time: new Date() 
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Log Food</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Meal Type</label>
                        <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snack">Snack</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Food Item</label>
                        <input
                            type="text"
                            value={food}
                            onChange={(e) => setFood(e.target.value)}
                            placeholder="What did you eat?"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Calories</label>
                        <input
                            type="number"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            placeholder="Estimated calories"
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Add Food
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Workout Modal Component
const WorkoutModal = ({ onClose, onSave }) => {
    const [workoutType, setWorkoutType] = useState('cardio');
    const [duration, setDuration] = useState('');
    const [intensity, setIntensity] = useState('medium');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            type: workoutType, 
            duration: parseInt(duration),
            intensity,
            date: new Date() 
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Log Workout</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Workout Type</label>
                        <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)}>
                            <option value="cardio">Cardio</option>
                            <option value="strength">Strength Training</option>
                            <option value="yoga">Yoga</option>
                            <option value="sports">Sports</option>
                            <option value="hiit">HIIT</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Duration (minutes)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="Workout duration"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Intensity</label>
                        <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Log Workout
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Nutrition;