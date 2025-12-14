import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { NutritionProvider } from './context/NutritionContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import Progress from './pages/Progress'; // ← ADD THIS IMPORT
import Community from './pages/Community';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import Exercises from './pages/Exercises';
import ExerciseDetail from './pages/ExerciseDetail';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';

import './css/variables.css';
import './css/App.css';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const errorHandler = (error) => {
      console.error('React Error Boundary caught:', error);
      setHasError(true);
      setError(error);
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>Please refresh the page or try again later.</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Refresh Page
        </button>
      </div>
    );
  }

  return children;
};

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <WorkoutProvider>
                    <NutritionProvider>
                        <ErrorBoundary>
                        <div className="App">
                            <Navbar />
                            <main className="main-content">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/about" element={<About />} />
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
                                    <Route path="/nutrition" element={
                                        <ProtectedRoute>
                                            <Nutrition />
                                        </ProtectedRoute>
                                    } />
                                    {/* ADD THIS ROUTE - Progress Page */}
                                    <Route path="/progress" element={
                                        <ProtectedRoute>
                                            <Progress />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/community" element={
                                        <ProtectedRoute>
                                            <Community />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/profile" element={
                                        <ProtectedRoute>
                                            <Profile />
                                        </ProtectedRoute>
                                    } />
                                    {/* IMPORTANT: ProfileSetup is protected and should only be accessible if needed */}
                                    <Route path="/profile-setup" element={
                                        <ProtectedRoute>
                                            <ProfileSetup />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/exercises" element={
                                        <ProtectedRoute>
                                            <Exercises />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/exercises/:id" element={
                                        <ProtectedRoute>
                                            <ExerciseDetail />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/signup" element={<Signup />} />
                                    <Route path="*" element={
                                        <div>
                                            <h2>The page you're looking for doesn't exist.</h2>
                                            <a href="/">Return Home</a>
                                        </div>
                                    } />
                                </Routes>
                            </main>
                        </div>
                        </ErrorBoundary>
                    </NutritionProvider>
                </WorkoutProvider>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;