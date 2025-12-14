import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function isProfileComplete(user) {
    if (!user || !user.profile) return false;
    const p = user.profile;
    return !!(p.age && p.height && p.weight && p.gender && p.fitnessLevel);
}

// Only block non-auth routes (like /login, /signup) if user is already in
const profileSetupWhitelist = ['/profile-setup', '/logout', '/login', '/signup'];

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Checking authentication...</p>
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Allow certain routes even if profile incomplete
    if (!isProfileComplete(user) 
        && !profileSetupWhitelist.includes(location.pathname)) {
        return <Navigate to="/profile-setup" replace />;
    }
    return children;
};

export default ProtectedRoute;
