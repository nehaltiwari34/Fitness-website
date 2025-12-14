const mongoose = require('mongoose');
const { Exercise, WorkoutTemplate } = require('../models/Workout.model');
const exercises = require('./exercises');
const workoutTemplates = require('./workoutTemplates');
require('dotenv').config();

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitnessdb');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Exercise.deleteMany({});
        await WorkoutTemplate.deleteMany({});
        console.log('✅ Cleared existing data');

        // Insert exercises
        const createdExercises = await Exercise.insertMany(exercises);
        console.log(`✅ Inserted ${createdExercises.length} exercises`);

        // Create exercise ID mapping for workout templates
        const exerciseMap = {};
        createdExercises.forEach(exercise => {
            exerciseMap[exercise.name.toLowerCase()] = exercise._id;
        });

        // Update workout templates with actual exercise IDs
        const templatesWithIds = workoutTemplates.map(template => ({
            ...template,
            exercises: template.exercises.map(ex => ({
                ...ex,
                exercise: exerciseMap[ex.exercise]
            }))
        }));

        // Insert workout templates
        const createdTemplates = await WorkoutTemplate.insertMany(templatesWithIds);
        console.log(`✅ Inserted ${createdTemplates.length} workout templates`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📊 Sample Data Created:');
        console.log(`   💪 ${createdExercises.length} exercises`);
        console.log(`   📋 ${createdTemplates.length} workout templates`);
        console.log('\n🚀 Your workout module is ready to use!');

    } catch (error) {
        console.error('❌ Seeding error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Run seeding if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;