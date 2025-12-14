import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import '../css/Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/profile');
            if (response.data.success) {
                setProfileData(response.data.user);
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
            setProfileData(getDefaultProfileData());
        } finally {
            setLoading(false);
        }
    };

    const getDefaultProfileData = () => ({
        profile: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            age: '',
            gender: '',
            height: '',
            weight: '',
            fitnessLevel: 'beginner',
            goals: []
        },
        fitnessPlan: {
            goal: 'weight_loss',
            activityLevel: 'moderate',
            dailyCalories: 2000,
            proteinGoal: 150,
            carbsGoal: 250,
            fatGoal: 70,
            waterGoal: 2000
        },
        preferences: {
            theme: 'light',
            notifications: true,
            emailUpdates: true,
            measurementSystem: 'metric'
        }
    });

    const handleProfileUpdate = async (updatedData) => {
        try {
            setSaving(true);
            const response = await api.put('/profile', updatedData);
            if (response.data.success) {
                setProfileData(response.data.user);
                updateUser(response.data.user);
                alert('✅ Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('❌ Error updating profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleFitnessPlanUpdate = async (updatedPlan) => {
        try {
            setSaving(true);
            const response = await api.put('/profile/fitness-plan', updatedPlan);
            if (response.data.success) {
                setProfileData(response.data.user);
                alert('✅ Fitness plan updated successfully!');
            }
        } catch (error) {
            console.error('Error updating fitness plan:', error);
            alert('❌ Error updating fitness plan. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handlePreferencesUpdate = async (updatedPreferences) => {
        try {
            setSaving(true);
            const response = await api.put('/profile/preferences', updatedPreferences);
            if (response.data.success) {
                setProfileData(response.data.user);
                alert('✅ Preferences updated successfully!');
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            alert('❌ Error updating preferences. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !profileData) {
        return (
            <div className="profile-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Profile & Settings</h1>
                <p>Manage your personal information and preferences</p>
            </div>

            {/* Navigation Tabs */}
            <div className="profile-nav">
                <button 
                    className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    👤 Personal Info
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'fitness' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fitness')}
                >
                    💪 Fitness Plan
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preferences')}
                >
                    ⚙️ Preferences
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    🔒 Security
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <ProfileTab 
                    data={profileData.profile}
                    onSave={handleProfileUpdate}
                    saving={saving}
                />
            )}

            {/* Fitness Plan Tab */}
            {activeTab === 'fitness' && (
                <FitnessPlanTab 
                    data={profileData.fitnessPlan}
                    onSave={handleFitnessPlanUpdate}
                    saving={saving}
                />
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
                <PreferencesTab 
                    data={profileData.preferences}
                    onSave={handlePreferencesUpdate}
                    saving={saving}
                />
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <SecurityTab />
            )}
        </div>
    );
};

// Profile Tab Component
const ProfileTab = ({ data, onSave, saving }) => {
    const [formData, setFormData] = useState(data);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="profile-tab">
            <div className="section-header">
                <h2>Personal Information</h2>
                <p>Update your basic profile details</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Age</label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={(e) => handleChange('age', e.target.value)}
                            min="16"
                            max="100"
                        />
                    </div>
                    <div className="form-group">
                        <label>Gender</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => handleChange('gender', e.target.value)}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Height (cm)</label>
                        <input
                            type="number"
                            value={formData.height}
                            onChange={(e) => handleChange('height', e.target.value)}
                            min="100"
                            max="250"
                        />
                    </div>
                    <div className="form-group">
                        <label>Weight (kg)</label>
                        <input
                            type="number"
                            value={formData.weight}
                            onChange={(e) => handleChange('weight', e.target.value)}
                            min="30"
                            max="300"
                            step="0.1"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Fitness Level</label>
                    <select
                        value={formData.fitnessLevel}
                        onChange={(e) => handleChange('fitnessLevel', e.target.value)}
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Fitness Goals</label>
                    <div className="goals-checkboxes">
                        {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness'].map(goal => (
                            <label key={goal} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.goals?.includes(goal)}
                                    onChange={(e) => {
                                        const newGoals = e.target.checked
                                            ? [...(formData.goals || []), goal]
                                            : (formData.goals || []).filter(g => g !== goal);
                                        handleChange('goals', newGoals);
                                    }}
                                />
                                <span>{goal}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    {showSuccess && (
                        <span className="success-message">✅ Profile updated successfully!</span>
                    )}
                </div>
            </form>
        </div>
    );
};

// Fitness Plan Tab Component
const FitnessPlanTab = ({ data, onSave, saving }) => {
    const [formData, setFormData] = useState(data);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Calculate macros based on goal and activity level
    const calculateMacros = () => {
        // This would be more sophisticated in a real app
        const baseCalories = {
            weight_loss: 1800,
            maintenance: 2200,
            muscle_gain: 2500
        }[formData.goal] || 2000;

        const activityMultiplier = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9
        }[formData.activityLevel] || 1.55;

        const dailyCalories = Math.round(baseCalories * activityMultiplier);
        
        return {
            calories: dailyCalories,
            protein: Math.round(dailyCalories * 0.3 / 4),
            carbs: Math.round(dailyCalories * 0.4 / 4),
            fat: Math.round(dailyCalories * 0.3 / 9)
        };
    };

    const calculatedMacros = calculateMacros();

    return (
        <div className="fitness-plan-tab">
            <div className="section-header">
                <h2>Fitness Goals & Plan</h2>
                <p>Customize your fitness targets and nutrition goals</p>
            </div>

            <form onSubmit={handleSubmit} className="fitness-form">
                <div className="form-group">
                    <label>Primary Goal</label>
                    <select
                        value={formData.goal}
                        onChange={(e) => handleChange('goal', e.target.value)}
                    >
                        <option value="weight_loss">Weight Loss</option>
                        <option value="muscle_gain">Muscle Gain</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="endurance">Endurance</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Activity Level</label>
                    <select
                        value={formData.activityLevel}
                        onChange={(e) => handleChange('activityLevel', e.target.value)}
                    >
                        <option value="sedentary">Sedentary (little to no exercise)</option>
                        <option value="light">Light (exercise 1-3 times/week)</option>
                        <option value="moderate">Moderate (exercise 3-5 times/week)</option>
                        <option value="active">Active (exercise 6-7 times/week)</option>
                        <option value="very_active">Very Active (physical job + exercise)</option>
                    </select>
                </div>

                {/* Calculated Macros Display */}
                <div className="macros-preview">
                    <h4>Recommended Daily Targets</h4>
                    <div className="macros-cards">
                        <div className="macro-preview-card">
                            <span>Calories</span>
                            <strong>{calculatedMacros.calories}</strong>
                            <span>kcal</span>
                        </div>
                        <div className="macro-preview-card">
                            <span>Protein</span>
                            <strong>{calculatedMacros.protein}</strong>
                            <span>grams</span>
                        </div>
                        <div className="macro-preview-card">
                            <span>Carbs</span>
                            <strong>{calculatedMacros.carbs}</strong>
                            <span>grams</span>
                        </div>
                        <div className="macro-preview-card">
                            <span>Fat</span>
                            <strong>{calculatedMacros.fat}</strong>
                            <span>grams</span>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Daily Calorie Target</label>
                    <input
                        type="number"
                        value={formData.dailyCalories}
                        onChange={(e) => handleChange('dailyCalories', parseInt(e.target.value))}
                        min="1200"
                        max="5000"
                    />
                </div>

                <div className="macros-inputs">
                    <h4>Macronutrient Goals</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Protein (g)</label>
                            <input
                                type="number"
                                value={formData.proteinGoal}
                                onChange={(e) => handleChange('proteinGoal', parseInt(e.target.value))}
                                min="0"
                                max="500"
                            />
                        </div>
                        <div className="form-group">
                            <label>Carbs (g)</label>
                            <input
                                type="number"
                                value={formData.carbsGoal}
                                onChange={(e) => handleChange('carbsGoal', parseInt(e.target.value))}
                                min="0"
                                max="1000"
                            />
                        </div>
                        <div className="form-group">
                            <label>Fat (g)</label>
                            <input
                                type="number"
                                value={formData.fatGoal}
                                onChange={(e) => handleChange('fatGoal', parseInt(e.target.value))}
                                min="0"
                                max="200"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Daily Water Goal (ml)</label>
                    <input
                        type="number"
                        value={formData.waterGoal}
                        onChange={(e) => handleChange('waterGoal', parseInt(e.target.value))}
                        min="1000"
                        max="5000"
                        step="100"
                    />
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Update Fitness Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Preferences Tab Component
const PreferencesTab = ({ data, onSave, saving }) => {
    const [formData, setFormData] = useState(data);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="preferences-tab">
            <div className="section-header">
                <h2>App Preferences</h2>
                <p>Customize your experience</p>
            </div>

            <form onSubmit={handleSubmit} className="preferences-form">
                <div className="preference-section">
                    <h4>Appearance</h4>
                    <div className="form-group">
                        <label>Theme</label>
                        <select
                            value={formData.theme}
                            onChange={(e) => handleChange('theme', e.target.value)}
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto (System)</option>
                        </select>
                    </div>
                </div>

                <div className="preference-section">
                    <h4>Notifications</h4>
                    <div className="checkbox-group">
                        <label className="checkbox-label large">
                            <input
                                type="checkbox"
                                checked={formData.notifications}
                                onChange={(e) => handleChange('notifications', e.target.checked)}
                            />
                            <div className="checkbox-content">
                                <span className="checkbox-title">Push Notifications</span>
                                <span className="checkbox-description">Receive workout reminders and progress updates</span>
                            </div>
                        </label>

                        <label className="checkbox-label large">
                            <input
                                type="checkbox"
                                checked={formData.emailUpdates}
                                onChange={(e) => handleChange('emailUpdates', e.target.checked)}
                            />
                            <div className="checkbox-content">
                                <span className="checkbox-title">Email Updates</span>
                                <span className="checkbox-description">Receive weekly progress reports and tips</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="preference-section">
                    <h4>Units & Measurements</h4>
                    <div className="form-group">
                        <label>Measurement System</label>
                        <select
                            value={formData.measurementSystem}
                            onChange={(e) => handleChange('measurementSystem', e.target.value)}
                        >
                            <option value="metric">Metric (kg, cm)</option>
                            <option value="imperial">Imperial (lbs, inches)</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Security Tab Component
const SecurityTab = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            alert('❌ New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            alert('❌ Password must be at least 6 characters long');
            return;
        }

        try {
            setChangingPassword(true);
            const response = await api.put('/auth/change-password', {
                currentPassword,
                newPassword
            });

            if (response.data.success) {
                alert('✅ Password changed successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            alert('❌ Error changing password. Please try again.');
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="security-tab">
            <div className="section-header">
                <h2>Security Settings</h2>
                <p>Manage your account security</p>
            </div>

            <div className="security-sections">
                <div className="security-section">
                    <h4>Change Password</h4>
                    <form onSubmit={handlePasswordChange} className="password-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={changingPassword}
                        >
                            {changingPassword ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </form>
                </div>

                <div className="security-section">
                    <h4>Account Actions</h4>
                    <div className="account-actions">
                        <button className="btn-outline warning">
                            Export My Data
                        </button>
                        <button className="btn-outline danger">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;