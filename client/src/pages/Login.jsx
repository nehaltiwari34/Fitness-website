import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
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
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);
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
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>FitTrack</h1>
                    <h2>Welcome Back</h2>
                    <p>Sign in to your FitTrack account</p>
                </div>
                {error && (
                    <div className="auth-error">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            disabled={loading}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;