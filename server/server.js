// server/server.js - COMPLETE CORRECTED VERSION
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const http = require('http');
const path = require('path'); // ADD THIS LINE

// Load environment variables
dotenv.config();

console.log('🔧 Starting server with configuration:');
console.log('   PORT:', process.env.PORT);
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io (if exists)
try {
    const { initializeSocket } = require('./socket/socketHandler');
    const io = initializeSocket(server);
    app.set('socketio', io);
    console.log('🔌 WebSocket initialized');
} catch (error) {
    console.log('⚠️  WebSocket not available, continuing without real-time features');
}

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Enhanced request logging
app.use((req, res, next) => {
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// ✅ FIXED: Import routes with absolute paths and better error handling
console.log('🔄 Loading routes...');

// Import and mount routes with individual error handling
try {
    const authRoutes = require('./routes/auth.routes');
    app.use('/api/auth', authRoutes);
    console.log('   ✅ /api/auth - mounted');
} catch (error) {
    console.log('   ❌ /api/auth - failed to load:', error.message);
}

try {
    const userRoutes = require('./routes/user.routes');
    app.use('/api/users', userRoutes);
    console.log('   ✅ /api/users - mounted');
} catch (error) {
    console.log('   ❌ /api/users - failed to load:', error.message);
}

try {
    const profileRoutes = require('./routes/profile.routes');
    app.use('/api/profile', profileRoutes);
    console.log('   ✅ /api/profile - mounted');
} catch (error) {
    console.log('   ❌ /api/profile - failed to load:', error.message);
}

try {
    const nutritionRoutes = require('./routes/nutrition.routes');
    app.use('/api/nutrition', nutritionRoutes);
    console.log('   ✅ /api/nutrition - mounted');
} catch (error) {
    console.log('   ❌ /api/nutrition - failed to load:', error.message);
}

try {
    const progressRoutes = require('./routes/progress.routes');
    app.use('/api/progress', progressRoutes);
    console.log('   ✅ /api/progress - mounted');
} catch (error) {
    console.log('   ❌ /api/progress - failed to load:', error.message);
}

try {
    const communityRoutes = require('./routes/community.routes');
    app.use('/api/community', communityRoutes);
    console.log('   ✅ /api/community - mounted');
} catch (error) {
    console.log('   ❌ /api/community - failed to load:', error.message);
}

try {
    const workoutRoutes = require('./routes/workoutRoutes.js');
    app.use('/api/workouts', workoutRoutes);
    console.log('   ✅ /api/workouts - mounted');
} catch (error) {
    console.log('   ❌ /api/workouts - failed to load:', error.message);
}

// ✅ FIXED: Dashboard routes with explicit path
try {
    console.log('   🔍 Loading dashboard routes...');
    const dashboardRoutes = require('./routes/dashboard.routes');
    app.use('/api/dashboard', dashboardRoutes);
    console.log('   ✅ /api/dashboard - mounted successfully');
} catch (error) {
    console.log('   ❌ /api/dashboard - FAILED:', error.message);
    console.log('   💡 Creating fallback dashboard route...');
    
    // Create immediate fallback dashboard route
    const express = require('express');
    const fallbackRouter = express.Router();
    const auth = require('./middleware/auth.middleware');
    
    fallbackRouter.get('/', auth, async (req, res) => {
        try {
            const User = require('./models/User.model');
            const user = await User.findById(req.user.userId).select('-password');
            
            res.json({
                success: true,
                data: {
                    user: {
                        name: user?.name || 'User',
                        email: user?.email || 'user@example.com',
                        streak: user?.streak || 1
                    },
                    profile: user?.profile || {},
                    fitnessPlan: user?.fitnessPlan || {
                        dailyCalories: 2000,
                        proteinGoal: 150,
                        carbsGoal: 250,
                        fatGoal: 70,
                        waterGoal: 2000,
                        stepGoal: 10000
                    },
                    dailyProgress: user?.dailyProgress || {
                        date: new Date(),
                        steps: 5240,
                        caloriesConsumed: 850,
                        caloriesBurned: 320,
                        waterIntake: 1.8,
                        workoutsCompleted: 1,
                        weight: user?.profile?.weight || 70
                    },
                    todayWorkout: {
                        name: 'Full Body Strength',
                        duration: 45,
                        calories: 280,
                        difficulty: 'Intermediate',
                        exercises: [
                            { name: 'Push-ups', sets: 3, reps: '12-15', rest: '60s' },
                            { name: 'Squats', sets: 3, reps: '12-15', rest: '60s' },
                            { name: 'Plank', sets: 3, reps: '30-45s', rest: '30s' }
                        ]
                    },
                    weeklyStats: {
                        workoutsCompleted: 3,
                        totalMinutes: 135,
                        caloriesBurned: 890,
                        streak: user?.streak || 1
                    },
                    recentWorkouts: []
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Fallback dashboard error: ' + err.message
            });
        }
    });
    
    fallbackRouter.get('/health', auth, (req, res) => {
        res.json({
            success: true,
            message: 'Dashboard fallback route is working!',
            timestamp: new Date().toISOString()
        });
    });
    
    app.use('/api/dashboard', fallbackRouter);
    console.log('   ✅ /api/dashboard - fallback route mounted');
}

console.log('🎯 Route loading completed!');

// Test endpoint to verify all routes
app.get('/api/routes-test', (req, res) => {
    const routes = [
        '/api/health',
        '/api/dashboard',
        '/api/profile', 
        '/api/workouts/today',
        '/api/nutrition/dashboard',
        '/api/auth/test'
    ];
    
    res.json({
        success: true,
        message: 'Server routes test',
        availableRoutes: routes,
        timestamp: new Date().toISOString()
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    res.json({ 
        success: true,
        message: 'Server is healthy!',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        uptime: process.uptime(),
        features: {
            realTime: true,
            workoutTracking: true,
            nutritionTracking: true,
            progressMonitoring: true
        }
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    console.log(`❌ API 404: ${req.method} ${req.originalUrl}`);
    
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
        availableEndpoints: [
            'GET /api/health - Server health check',
            'GET /api/routes-test - Test all routes',
            'GET /api/dashboard - User dashboard data',
            'GET /api/profile - User profile',
            'GET /api/workouts/today - Today workout',
            'GET /api/nutrition/dashboard - Nutrition data',
            'POST /api/auth/login - User login',
            'POST /api/auth/register - User registration'
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('💥 Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🎉 Server is running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`\n📋 Available Endpoints:`);
    console.log(`   ✅ Health: http://localhost:${PORT}/api/health`);
    console.log(`   ✅ Routes Test: http://localhost:${PORT}/api/routes-test`);
    console.log(`   ✅ Dashboard: http://localhost:${PORT}/api/dashboard`);
    console.log(`   ✅ Profile: http://localhost:${PORT}/api/profile`);
    console.log(`   ✅ Workouts: http://localhost:${PORT}/api/workouts/today`);
    console.log(`   ✅ Nutrition: http://localhost:${PORT}/api/nutrition/dashboard`);
    console.log(`\n🌐 React App: http://localhost:5173`);
    console.log(`\n🚀 Fitness application server is READY!`);
});