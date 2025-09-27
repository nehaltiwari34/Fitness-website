import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
        setIsMenuOpen(false)
    }

    const handleNavClick = () => {
        setIsMenuOpen(false)
    }

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo" onClick={handleNavClick}>
                    FitTrack
                </Link>

                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="nav-link" onClick={handleNavClick}>
                                Dashboard
                            </Link>
                            <Link to="/workouts" className="nav-link" onClick={handleNavClick}>
                                Workouts
                            </Link>
                            <Link to="/nutrition" className="nav-link" onClick={handleNavClick}>
                                Nutrition
                            </Link>
                            <Link to="/progress" className="nav-link" onClick={handleNavClick}>
                                Progress
                            </Link>
                            <Link to="/community" className="nav-link" onClick={handleNavClick}>
                                Community
                            </Link>
                            <button onClick={handleLogout} className="nav-link logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/about" className="nav-link" onClick={handleNavClick}>
                                About
                            </Link>
                            <Link to="/login" className="nav-link" onClick={handleNavClick}>
                                Login
                            </Link>
                            <Link to="/signup" className="nav-link signup-btn" onClick={handleNavClick}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                <div className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <span className={isMenuOpen ? 'active' : ''}></span>
                    <span className={isMenuOpen ? 'active' : ''}></span>
                    <span className={isMenuOpen ? 'active' : ''}></span>
                </div>
            </div>
        </nav>
    )
}

export default Navbar