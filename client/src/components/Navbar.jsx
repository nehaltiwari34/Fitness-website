import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/Navbar.css";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const active = (path) => location.pathname === path ? "active" : "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="ft-navbar">
      <div className="ft-navbar-row">
        {/* Left: Brand */}
        <div className="ft-brand">
          <Link to="/" className="ft-brand-link">
            <span className="ft-logo" role="img" aria-label="Muscle">💪</span>
            <span className="ft-title">FitTrack</span>
          </Link>
        </div>
        {/* Right: Navigation */}
        <div className="ft-navlinks">
          {/* UNAUTHENTICATED NAVIGATION */}
          {!user && (
            <>
              <Link to="/" className={`ft-navlink ${active("/")}`}>
                <span role="img" aria-label="Home">🏠</span> Home
              </Link>
              <Link to="/about" className={`ft-navlink ${active("/about")}`}>
                <span role="img" aria-label="About">ℹ️</span> About
              </Link>
              <Link to="/login" className={`ft-navlink ft-login ${active("/login")}`}>
                <span role="img" aria-label="Login">🔐</span> Login
              </Link>
              <Link to="/signup" className={`ft-navlink ft-signup ${active("/signup")}`}>
                <span role="img" aria-label="Sign Up">✨</span> Sign Up
              </Link>
            </>
          )}
          {/* AUTHENTICATED NAVIGATION */}
          {user && (
            <>
              <Link to="/dashboard" className={`ft-navlink ${active("/dashboard")}`}>
                <span role="img" aria-label="Dashboard">📊</span> Dashboard
              </Link>
              <Link to="/nutrition" className={`ft-navlink ${active("/nutrition")}`}>
                <span role="img" aria-label="Nutrition">🍎</span> Nutrition
              </Link>
              <Link to="/workouts" className={`ft-navlink ${active("/workouts")}`}>
                <span role="img" aria-label="Workouts">🏋️</span> Workout
              </Link>
              <Link to="/progress" className={`ft-navlink ${active("/progress")}`}>
                <span role="img" aria-label="Progress">📈</span> Progress
              </Link>
              <Link to="/community" className={`ft-navlink ${active("/community")}`}>
                <span role="img" aria-label="Community">👥</span> Community
              </Link>
              <button
                className="ft-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
