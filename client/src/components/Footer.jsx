import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>FitTrack</h3>
          <p>Your personal fitness companion for a healthier lifestyle.</p>
        </div>
        
        <div className="footer-section">o
          <h4>Quick Links</h4>
          <div className="footer-links">
            <Link to="/">Dashboard</Link>
            <Link to="/workouts">Workouts</Link>
            <Link to="/nutrition">Nutrition</Link>
            <Link to="/about">About Us</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Legal</h4>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-links">
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="Twitter">Twitter</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 FitTrack. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer