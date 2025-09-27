import React, { useState, useEffect } from 'react';
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
    const { login, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('Login form submitted:', formData); // Debug log

        try {
            const result = await login(formData.email, formData.password);
            console.log('Login result:', result); // Debug log
            
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err); // Debug log
            setError('An unexpected error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    // Demo login for testing
    const handleDemoLogin = async () => {
        setFormData({
            email: 'demo@fittrack.com',
            password: 'demo123'
        });
        
        // Wait a bit for state to update, then submit
        setTimeout(async () => {
            setLoading(true);
            setError('');
            
            const result = await login('demo@fittrack.com', 'demo123');
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'Demo login failed');
            }
            setLoading(false);
        }, 100);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
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
                            disabled={loading || authLoading}
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
                            disabled={loading || authLoading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-full"
                        disabled={loading || authLoading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or try a demo account</span>
                </div>

                <button 
                    onClick={handleDemoLogin}
                    className="btn btn-secondary btn-full"
                    disabled={loading || authLoading}
                    type="button"
                >
                    Demo Login
                </button>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
                </div>

                {/* Debug info - remove in production */}
                <div style={{ 
                    marginTop: '20px', 
                    padding: '10px', 
                    background: '#f5f5f5', 
                    borderRadius: '5px', 
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}>
                    <strong>Debug Info:</strong><br />
                    Email: {formData.email}<br />
                    Loading: {loading ? 'Yes' : 'No'}<br />
                    Auth Loading: {authLoading ? 'Yes' : 'No'}<br />
                    User: {user ? 'Logged In' : 'Not Logged In'}<br />
                    Error: {error || 'None'}
                </div>
            </div>
        </div>
    );
};

export default Login;