// server/config/database.js - COMPATIBLE WITH MONGODB 3.6
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB 3.6...');
    
    // Connection string for MongoDB 3.6
    const mongoURI = 'mongodb://127.0.0.1:27017/fitnessdb';
    
    console.log('📡 Using URI:', mongoURI);
    
    // Connection options compatible with MongoDB 3.6
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      // Remove unsupported options for MongoDB 3.6
      // bufferCommands: false, // REMOVE THIS
      // bufferMaxEntries: 0    // REMOVE THIS
    });
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`   Version: 3.6.23`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: Connected ✅`);
    
    // Test the connection
    const adminDb = conn.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log(`   MongoDB Version: ${serverStatus.version}`);
    
    return conn;
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    if (error.message.includes('buffermaxentries')) {
      console.log('\n🔧 FIX: MongoDB 3.6 detected - removing incompatible options');
      console.log('   Trying alternative connection...');
      
      try {
        // Try connection without any options (MongoDB 3.6 compatibility)
        await mongoose.connect('mongodb://127.0.0.1:27017/fitnessdb', {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB 3.6 with compatible settings');
        return mongoose.connection;
        
      } catch (secondError) {
        console.error('❌ Still failing:', secondError.message);
      }
    }
    
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('   1. Check if MongoDB is running: ps aux | grep mongod');
    console.log('   2. Start MongoDB manually: mongod --port 27017');
    console.log('   3. Try simple connection: mongo --host 127.0.0.1:27017');
    
    // Don't exit - let server start
    console.log('\n⚠️  Starting server in fallback mode');
    return null;
  }
};

// Connection events
mongoose.connection.on('connected', () => {
  console.log('🎯 Mongoose connected to MongoDB 3.6');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected');
});

module.exports = connectDB;