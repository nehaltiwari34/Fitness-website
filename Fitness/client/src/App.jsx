import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

// Home Route Component - Shows home page for everyone, no redirects
const HomeRoute = () => {
    return <Home />;
};

function AppContent() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                
                <main className="main-content">
                    <Routes>
                        {/* Home Route - Always show home page */}
                        <Route path="/" element={<HomeRoute />} />
                        
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/about" element={<About />} />
                        
                        {/* Protected Routes - Only for authenticated users */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/workouts" element={
                            <ProtectedRoute>
                                <Workouts />
                            </ProtectedRoute>
                        } />
                        <Route path="/workouts/create" element={
                            <ProtectedRoute>
                                <CreateWorkout />
                            </ProtectedRoute>
                        } />
                        <Route path="/my-plan" element={
                            <ProtectedRoute>
                                <MyPlan />
                            </ProtectedRoute>
                        } />
                        <Route path="/exercises" element={
                            <ProtectedRoute>
                                <Exercises />
                            </ProtectedRoute>
                        } />
                        <Route path="/programs" element={
                            <ProtectedRoute>
                                <Programs />
                            </ProtectedRoute>
                        } />
                        <Route path="/history" element={
                            <ProtectedRoute>
                                <History />
                            </ProtectedRoute>
                        } />
                        <Route path="/progress" element={
                            <ProtectedRoute>
                                <Progress />
                            </ProtectedRoute>
                        } />
                        <Route path="/nutrition" element={
                            <ProtectedRoute>
                                <Nutrition />
                            </ProtectedRoute>
                        } />
                        <Route path="/community" element={
                            <ProtectedRoute>
                                <Community />
                            </ProtectedRoute>
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

function App() {
    return (
        <AuthProvider>
            <WorkoutProvider>
                <AppContent />
            </WorkoutProvider>
        </AuthProvider>
    );
}

// 404 Component
const NotFound = () => {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1>404 - Page Not Found</h1>
                <p>Oops! The page you're looking for doesn't exist.</p>
                <div className="not-found-actions">
                    <Link to="/" className="btn-primary">Go Home</Link>
                    <Link to="/dashboard" className="btn-outline">Go to Dashboard</Link>
                </div>
            </div>
        </div>
    );
};

export default App;