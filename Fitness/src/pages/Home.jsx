import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to FitTrack</h1>
          <p>Your personal fitness companion for a healthier lifestyle</p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-primary">Get Started</Link>
            <Link to="/login" className="btn-outline">Login</Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2>Why Choose FitTrack?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💪</div>
              <h3>Workout Plans</h3>
              <p>Personalized workout routines tailored to your goals and fitness level</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your fitness journey with detailed analytics and insights</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community Support</h3>
              <p>Connect with like-minded fitness enthusiasts for motivation</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;