const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔗 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitnessdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Test the connection
    const adminDb = conn.connection.db.admin();
    const result = await adminDb.ping();
    console.log('📡 Database ping:', result);
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('💡 Tips:');
    console.log('   - Make sure MongoDB is running: brew services start mongodb/brew/mongodb-community');
    console.log('   - Check if MongoDB URI is correct in .env file');
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

module.exports = connectDB;
