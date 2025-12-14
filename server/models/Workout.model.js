// server/models/Workout.model.js - COMPLETE & CORRECTED VERSION
const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Core', 'Upper Body', 'Lower Body', 'Full Body', 'Yoga', 'Pilates'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  sets: {
    type: Number,
    default: 3
  },
  reps: {
    type: String,
    default: '10-12'
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  rest: {
    type: Number, // in seconds
    default: 60
  },
  videoUrl: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  calories: {
    type: Number, // calories burned per minute
    default: 0
  },
  targets: [{
    type: String // e.g., ['chest', 'triceps', 'shoulders']
  }],
  equipment: [{
    type: String // e.g., ['dumbbells', 'resistance bands', 'yoga mat']
  }],
  instructions: [{
    type: String
  }],
  muscleGroup: {
    type: String,
    enum: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body', 'Cardio'],
    default: 'Full Body'
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const workoutSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  exercises: [{
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    completedSets: {
      type: Number,
      default: 0
    },
    completedReps: {
      type: String,
      default: '0'
    },
    weight: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  duration: {
    type: Number, // in minutes
    default: 0
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Challenging', 'Very Hard']
  },
  mood: {
    type: String,
    enum: ['Great', 'Good', 'Okay', 'Poor', 'Terrible']
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  goal: {
    type: String,
    enum: ['Weight Loss', 'Muscle Gain', 'Endurance', 'General Fitness', 'Strength', 'Flexibility', 'Maintenance'],
    default: 'General Fitness'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  duration: {
    type: Number, // in weeks
    default: 4
  },
  weeklySchedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    workouts: [{
      workout: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutTemplate'
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: {
        type: Date
      },
      notes: {
        type: String,
        default: ''
      }
    }]
  }],
  completed: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

const workoutTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'CrossFit', 'Custom', 'Bodyweight', 'Recovery'],
    default: 'Custom'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  calories: {
    type: Number, // estimated calories burned
    default: 200
  },
  exercises: [{
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: {
      type: Number,
      default: 3
    },
    reps: {
      type: String,
      default: '10-12'
    },
    order: {
      type: Number,
      default: 0
    },
    rest: {
      type: Number, // in seconds
      default: 60
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  targetMuscles: [{
    type: String
  }],
  equipmentRequired: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  targetType: {
    type: String,
    enum: ['workout', 'exercise', 'plan', 'template'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
exerciseSchema.index({ category: 1, difficulty: 1 });
exerciseSchema.index({ name: 'text', description: 'text' });
workoutSessionSchema.index({ userId: 1, completedAt: -1 });
workoutSessionSchema.index({ userId: 1, completed: 1 });
workoutPlanSchema.index({ userId: 1, isActive: 1 });
workoutTemplateSchema.index({ category: 1, difficulty: 1 });
workoutTemplateSchema.index({ isPublic: 1, likes: -1 });
commentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

// Virtual for workout session total exercises
workoutSessionSchema.virtual('totalExercises').get(function() {
  return this.exercises.length;
});

// Virtual for workout session completion percentage
workoutSessionSchema.virtual('completionPercentage').get(function() {
  if (this.exercises.length === 0) return 0;
  const completedExercises = this.exercises.filter(ex => ex.completed).length;
  return Math.round((completedExercises / this.exercises.length) * 100);
});

// Virtual for workout plan days remaining
workoutPlanSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Static method to get user's workout statistics
workoutSessionSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        completed: true
      }
    },
    {
      $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalMinutes: { $sum: '$duration' },
        totalCalories: { $sum: '$caloriesBurned' },
        avgDuration: { $avg: '$duration' },
        avgCalories: { $avg: '$caloriesBurned' }
      }
    }
  ]);

  return stats[0] || {
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    avgDuration: 0,
    avgCalories: 0
  };
};

// Static method to get popular exercises
exerciseSchema.statics.getPopularExercises = async function(limit = 10) {
  return this.aggregate([
    {
      $match: { isPublic: true }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Method to mark workout session as completed
workoutSessionSchema.methods.markComplete = function(duration, caloriesBurned, notes, rating, difficulty) {
  this.completed = true;
  this.completedAt = new Date();
  this.endTime = new Date();
  this.duration = duration || this.duration;
  this.caloriesBurned = caloriesBurned || this.caloriesBurned;
  this.notes = notes || this.notes;
  this.rating = rating;
  this.difficulty = difficulty;
  
  // Mark all exercises as completed
  this.exercises.forEach(exercise => {
    exercise.completed = true;
  });
  
  return this.save();
};

// Method to update exercise progress
workoutSessionSchema.methods.updateExerciseProgress = function(exerciseIndex, completedSets, completedReps, weight, notes) {
  if (this.exercises[exerciseIndex]) {
    this.exercises[exerciseIndex].completedSets = completedSets;
    this.exercises[exerciseIndex].completedReps = completedReps;
    this.exercises[exerciseIndex].weight = weight;
    this.exercises[exerciseIndex].notes = notes;
    this.exercises[exerciseIndex].completed = completedSets > 0;
  }
  return this.save();
};

// Pre-save middleware for workout plan
workoutPlanSchema.pre('save', function(next) {
  // Calculate end date based on duration
  if (this.startDate && this.duration && !this.endDate) {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + (this.duration * 7));
    this.endDate = endDate;
  }
  
  // Calculate progress based on completed workouts
  if (this.weeklySchedule && this.weeklySchedule.length > 0) {
    let totalWorkouts = 0;
    let completedWorkouts = 0;
    
    this.weeklySchedule.forEach(day => {
      day.workouts.forEach(workout => {
        totalWorkouts++;
        if (workout.completed) {
          completedWorkouts++;
        }
      });
    });
    
    this.progress = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;
    this.completed = this.progress >= 100;
  }
  
  next();
});

// Pre-save middleware for workout session
workoutSessionSchema.pre('save', function(next) {
  // Calculate calories burned if not provided
  if (!this.caloriesBurned && this.duration) {
    // Simple estimation: 8-12 calories per minute depending on intensity
    const caloriesPerMinute = this.difficulty === 'Very Hard' ? 12 : 
                             this.difficulty === 'Challenging' ? 10 : 8;
    this.caloriesBurned = Math.round(this.duration * caloriesPerMinute);
  }
  
  next();
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
const WorkoutTemplate = mongoose.model('WorkoutTemplate', workoutTemplateSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = {
  Exercise,
  WorkoutSession,
  WorkoutPlan,
  WorkoutTemplate,
  Comment
};