import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const result = await register(formData);
            if (result.success) {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const profile = savedUser?.profile || {};
    
    // Check if profile has REAL values (not defaults)
    const hasRealValues = (
        profile.age !== 25 || 
        profile.height !== 175 || 
        profile.weight !== 70 || 
        profile.gender !== 'other'
    );
    
    if (profile.age && profile.height && profile.weight && 
        profile.gender && profile.fitnessLevel && hasRealValues) {
        navigate('/dashboard');
    } else {
        navigate('/profile-setup');
    }
} else {
                setError(result.message || 'Registration failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Start your fitness journey today</p>
                </div>
                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Create a password (min. 6 characters)"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                            disabled={loading}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="btn btn-primary btn-full"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
