// src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/About.css';

const About = () => {
    const { user } = useAuth();

    return (
        <div className="about-container">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-content">
                    <h1>Transform Your Fitness Journey</h1>
                    <p>Join thousands of users who have achieved their fitness goals with our AI-powered personalized training plans</p>
                    <div className="hero-actions">
                        {user ? (
                            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
                        ) : (
                            <Link to="/signup" className="btn-primary">Start Your Journey</Link>
                        )}
                        <Link to="/programs" className="btn-outline">View Programs</Link>
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="stat">
                        <span className="stat-number">50K+</span>
                        <span className="stat-label">Active Users</span>
                    </div>
                    <div className="stat">
                        <span className="stat-number">95%</span>
                        <span className="stat-label">Success Rate</span>
                    </div>
                    <div className="stat">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">AI Support</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2>Why Choose FitTrack?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🤖</div>
                            <h3>AI-Powered Plans</h3>
                            <p>Get personalized workout and nutrition plans tailored to your body type, goals, and fitness level using advanced algorithms.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Smart Progress Tracking</h3>
                            <p>Monitor your progress with detailed analytics, real-time insights, and adaptive goal setting that evolves with you.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💪</div>
                            <h3>Expert Workouts</h3>
                            <p>Access hundreds of exercises and workout routines designed by certified fitness professionals and trainers.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🍎</div>
                            <h3>Nutrition Guidance</h3>
                            <p>Receive personalized meal plans, calorie tracking, and macro-nutrient optimization for optimal results.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📱</div>
                            <h3>Mobile Friendly</h3>
                            <p>Track your fitness anytime, anywhere with our responsive design that works perfectly on all devices.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">👥</div>
                            <h3>Community Support</h3>
                            <p>Join a supportive community, share achievements, and get motivated by others on the same journey.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <h2>How FitTrack Works</h2>
                    <div className="steps-container">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Create Your Profile</h3>
                                <p>Tell us about your fitness goals, body metrics, and experience level</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Get Personalized Plan</h3>
                                <p>Our AI generates a customized fitness and nutrition plan just for you</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Track & Improve</h3>
                                <p>Follow your plan, track progress, and watch as our system adapts to your results</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h3>Achieve Goals</h3>
                                <p>Reach your fitness targets with continuous support and optimized plans</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2>Ready to Transform Your Life?</h2>
                    <p>Join FitTrack today and start your journey to a healthier, stronger you</p>
                    <div className="cta-actions">
                        {user ? (
                            <Link to="/dashboard" className="btn-primary large">Continue Your Journey</Link>
                        ) : (
                            <>
                                <Link to="/signup" className="btn-primary large">Start Free Trial</Link>
                                <Link to="/login" className="btn-outline large">Existing User? Login</Link>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
