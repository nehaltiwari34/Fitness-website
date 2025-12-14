const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  bodyMeasurements: {
    chest: Number,
    waist: Number,
    arms: Number,
    hips: Number,
    thighs: Number
  },
  fitnessMetrics: {
    strength: Number, // 1-100 scale
    endurance: Number, // 1-100 scale
    flexibility: Number, // 1-100 scale
    overallFitness: Number // 1-100 scale
  },
  photos: [{
    url: String,
    description: String,
    takenAt: Date
  }],
  notes: String,
  mood: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor', 'terrible']
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Index for efficient queries
progressSchema.index({ userId: 1, date: -1 });

// Virtual for BMI calculation
progressSchema.virtual('bmi').get(function() {
  if (!this.weight || !this.userId?.profile?.height) return null;
  const heightInMeters = this.userId.profile.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
});

module.exports = mongoose.model('Progress', progressSchema);