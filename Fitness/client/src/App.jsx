import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import MyPlan from './pages/MyPlan';
import Exercises from './pages/Exercises';
import Programs from './pages/Programs';
import History from './pages/History';
import Nutrition from './pages/Nutrition';
import Progress from './pages/Progress';
import Community from './pages/Community';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateWorkout from './pages/CreateWorkout';
import About from './pages/About';
import ProfileSetup from './pages/ProfileSetup';

// Import CSS
import './css/App.css';
import './css/index.css';

// App Loading Component
const AppLoading = () => (
    <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading FitTrack...</p>
    </div>
);

// Home Route Component - Shows home page for everyone
const HomeRoute = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <AppLoading />;
    }
    
    return <Home />;
};

// Profile Check Component - Used within protected routes
const ProfileCheck = ({ children }) => {
    const { user } = useAuth();
    
    // Check if user has completed profile setup (has height data)
    const hasCompleteProfile = user?.profile?.height;
    
    if (!hasCompleteProfile) {
        return <Navigate to="/profile-setup" replace />;
    }
    
    return children;
};

// Protected Route with Profile Check
const ProtectedRouteWithProfile = ({ children }) => {
    return (
        <ProtectedRoute>
            <ProfileCheck>
                {children}
            </ProfileCheck>
        </ProtectedRoute>
    );
};

// Public Route - Redirect to dashboard if already logged in with complete profile
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <AppLoading />;
    }
    
    // If user is logged in and has complete profile, redirect to dashboard
    if (user && user.profile?.height) {
        return <Navigate to="/dashboard" replace />;
    }
    
    // If user is logged in but profile incomplete, redirect to profile setup
    if (user && !user.profile?.height) {
        return <Navigate to="/profile-setup" replace />;
    }
    
    return children;
};

// Profile Setup Route - Special handling
const ProfileSetupRoute = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <AppLoading />;
    }
    
    // If not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // If profile is already complete, redirect to dashboard
    if (user.profile?.height) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return <ProfileSetup />;
};

// Main App Content
function AppContent() {
    const { loading } = useAuth();
    
    if (loading) {
        return <AppLoading />;
    }
    
    return (
        <Router>
            <div className="App">
                <Navbar />
                
                <main className="main-content">
                    <Routes>
                        {/* Home Route - Accessible to all */}
                        <Route path="/" element={<HomeRoute />} />
                        
                        {/* Public Routes - Redirect if logged in */}
                        <Route path="/login" element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } />
                        <Route path="/signup" element={
                            <PublicRoute>
                                <Signup />
                            </PublicRoute>
                        } />
                        <Route path="/about" element={<About />} />
                        
                        {/* Profile Setup - Special route */}
                        <Route path="/profile-setup" element={<ProfileSetupRoute />} />
                        
                        {/* Protected Routes - Require authentication AND complete profile */}
                        <Route path="/dashboard" element={
                            <ProtectedRouteWithProfile>
                                <Dashboard />
                            </ProtectedRouteWithProfile>
                        } />
                        <Route path="/workouts" element={
                            <ProtectedRouteWithProfile>
                                <Workouts />
                            </ProtectedRouteWithProfile>
                        } />
                        <Route path="/workouts/create" element={
                            <ProtectedRouteWithProfile>
                                <CreateWorkout />
                            </ProtectedRouteWithProfile>
                        } />
                        <Route path="/my-plan" element={
                            <ProtectedRouteWithProfile>
                                <MyPlan />
                            </ProtectedRouteWithProfile>
                        } />
                        <Route path="/exercises" element={
                            <ProtectedRouteWithProfile>
                                <Exercises />
                            </ProtectedRouteWithProfile>
                        } />
                        <Route path="/programs" element={
                            <ProtectedRouteWithProfile>
                                <Programs />
                            </ProtectedRouteWithProfile>
                        } />
                        <Route path="/history" element={
                            <ProtectedRouteWithProfile>
                                <History />
                            </ProtectedRouteWithProfile>
                        } />
                        <Route path="/progress" element={
                            <ProtectedRouteWithProfile>
                                <Progress />
                            </ProtectedRouteWithProfile>
                        } />
                        <Route path="/nutrition" element={
                            <ProtectedRouteWithProfile>
                                <Nutrition />
                            </ProtectedRouteWithProfile>
                        } />
                        <Route path="/community" element={
                            <ProtectedRouteWithProfile>
                                <Community />
                            </ProtectedRouteWithProfile>
                        } />
                        
                        {/* 404 Page */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                
                <Footer />
            </div>
        </Router>
    );
}

// Main App Component
function App() {
    return (
        <AuthProvider>
            <WorkoutProvider>
                <AppContent />
            </WorkoutProvider>
        </AuthProvider>
    );
}

// 404 Not Found Component
const NotFound = () => {
    const { user } = useAuth();
    
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1>404 - Page Not Found</h1>
                <p>Oops! The page you're looking for doesn't exist.</p>
                <div className="not-found-actions">
                    <Link to="/" className="btn-primary">Go Home</Link>
                    {user ? (
                        <Link to="/dashboard" className="btn-outline">Go to Dashboard</Link>
                    ) : (
                        <Link to="/login" className="btn-outline">Go to Login</Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
