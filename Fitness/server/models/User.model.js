const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  // Personalization fields
  profile: {
    age: { type: Number, min: 13, max: 100 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    fitnessLevel: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    goals: { type: String, default: 'General fitness' },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate'
    }
  },
  // AI-generated fitness plan
  fitnessPlan: {
    dailyCalories: { type: Number, default: 2000 },
    proteinGoal: { type: Number, default: 150 },
    carbsGoal: { type: Number, default: 250 },
    fatGoal: { type: Number, default: 67 },
    waterGoal: { type: Number, default: 2000 }, // ml
    stepGoal: { type: Number, default: 10000 },
    workoutGoal: { type: Number, default: 16 },
    weeklySchedule: [{
      day: String,
      workoutType: String,
      duration: Number,
      caloriesBurned: Number,
      exercises: [String]
    }],
    recommendations: [String],
    fitnessTips: [String],
    lastUpdated: { type: Date, default: Date.now }
  },
  // Daily tracking
  dailyProgress: {
    date: { type: Date, default: Date.now },
    steps: { type: Number, default: 0 },
    caloriesConsumed: { type: Number, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
    waterIntake: { type: Number, default: 0 },
    workoutsCompleted: { type: Number, default: 0 },
    weight: { type: Number }
  },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Update streak method
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = new Date(this.lastActive);
  const diffTime = Math.abs(today - lastActive);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    this.streak += 1;
  } else if (diffDays > 1) {
    this.streak = 1; // Reset streak if missed a day
  }
  
  this.lastActive = today;
  return this.streak;
};

module.exports = mongoose.model('User', userSchema);
