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
  // Nutrition tracking
  nutritionLog: [{
    date: { type: Date, default: Date.now },
    foodName: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    mealType: String
  }],
  // Progress tracking
  measurements: [{
    date: { type: Date, default: Date.now },
    chest: Number,
    waist: Number,
    arms: Number,
    weight: Number
  }],
  progressPhotos: [{
    date: { type: Date, default: Date.now },
    url: String,
    description: String
  }],
  achievements: [{
    name: String,
    description: String,
    icon: String,
    unlocked: { type: Boolean, default: false },
    dateUnlocked: Date
  }],
  // Community features
  community: {
    joinedChallenges: [Number],
    viewedContent: [{
      contentId: Number,
      type: String,
      date: Date
    }]
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

// FIXED: Update streak method with proper date handling
userSchema.methods.updateStreak = async function() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActive = new Date(this.lastActive);
    lastActive.setHours(0, 0, 0, 0);
    
    const diffTime = today - lastActive;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`Streak check: Today: ${today}, LastActive: ${lastActive}, DiffDays: ${diffDays}, CurrentStreak: ${this.streak}`);
    
    if (diffDays === 1) {
      // Consecutive day - increment streak
      this.streak += 1;
      console.log(`✅ Streak incremented to: ${this.streak}`);
    } else if (diffDays > 1) {
      // Streak broken - reset to 1
      this.streak = 1;
      console.log(`🔄 Streak reset to: ${this.streak}`);
    } else if (diffDays === 0) {
      // Same day - maintain streak
      console.log(`📅 Same day - streak maintained: ${this.streak}`);
    }
    
    this.lastActive = new Date();
    await this.save();
    return this.streak;
    
  } catch (error) {
    console.error('Error updating streak:', error);
    return this.streak;
  }
};
// Add these fields to your existing User schema
userSchema.add({
  workoutPreferences: {
    goals: [String],
    availableTime: Number, // minutes per day
    availableDays: [String],
    equipment: [String],
    favoriteExercises: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise'
    }]
  },
  workoutStats: {
    totalWorkouts: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    totalCalories: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastWorkoutDate: Date
  }
});

module.exports = mongoose.model('User', userSchema);