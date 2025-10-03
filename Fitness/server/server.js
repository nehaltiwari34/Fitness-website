const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');

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

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Test route with database check
app.get('/api/test', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    res.json({ 
      success: true,
      message: 'Fitness API is working!',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API test failed',
      error: error.message
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
  console.log(`🌐 React App: http://localhost:5173`);
});

app.use('/api/profile', profileRoutes);
