const mongoose = require('mongoose');

const foodEntrySchema = new mongoose.Schema({
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
  foodName: {
    type: String,
    required: true,
    trim: true
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    default: 0,
    min: 0
  },
  carbs: {
    type: Number,
    default: 0,
    min: 0
  },
  fat: {
    type: Number,
    default: 0,
    min: 0
  },
  fiber: {
    type: Number,
    default: 0,
    min: 0
  },
  sugar: {
    type: Number,
    default: 0,
    min: 0
  },
  servingSize: {
    amount: Number,
    unit: String
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other'],
    default: 'other'
  },
  time: {
    type: Date,
    default: Date.now
  },
  notes: String,
  isCustom: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['manual', 'api', 'barcode'],
    default: 'manual'
  }
}, {
  timestamps: true
});

const waterIntakeSchema = new mongoose.Schema({
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
  amount: {
    type: Number, // in milliliters
    required: true,
    min: 0
  },
  time: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
foodEntrySchema.index({ userId: 1, date: -1 });
foodEntrySchema.index({ userId: 1, mealType: 1 });
waterIntakeSchema.index({ userId: 1, date: -1 });

// Static method to get daily summary
foodEntrySchema.statics.getDailySummary = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const summary = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalCalories: { $sum: '$calories' },
        totalProtein: { $sum: '$protein' },
        totalCarbs: { $sum: '$carbs' },
        totalFat: { $sum: '$fat' },
        totalFiber: { $sum: '$fiber' },
        totalSugar: { $sum: '$sugar' },
        entryCount: { $sum: 1 }
      }
    }
  ]);

  return summary[0] || {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    totalSugar: 0,
    entryCount: 0
  };
};

const FoodEntry = mongoose.model('FoodEntry', foodEntrySchema);
const WaterIntake = mongoose.model('WaterIntake', waterIntakeSchema);

module.exports = {
  FoodEntry,
  WaterIntake
};