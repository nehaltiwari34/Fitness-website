const workoutTemplates = [
    {
        name: "Full Body Strength",
        description: "Complete full-body workout targeting all major muscle groups",
        category: "Strength",
        difficulty: "Beginner",
        duration: 45,
        calories: 280,
        isPublic: true,
        tags: ["full body", "strength", "beginner"],
        exercises: [
            { exercise: "push-ups", sets: 3, reps: "10-12", order: 1 },
            { exercise: "bodyweight squats", sets: 4, reps: "15-20", order: 2 },
            { exercise: "lunges", sets: 3, reps: "10 per leg", order: 3 },
            { exercise: "plank", sets: 3, reps: "30-45 seconds", order: 4 },
            { exercise: "mountain climbers", sets: 3, reps: "20 seconds", order: 5 }
        ]
    },
    {
        name: "HIIT Cardio Blast",
        description: "High-intensity interval training for maximum calorie burn",
        category: "HIIT",
        difficulty: "Intermediate",
        duration: 25,
        calories: 300,
        isPublic: true,
        tags: ["cardio", "hiit", "fat burning"],
        exercises: [
            { exercise: "jumping jacks", sets: 4, reps: "30 seconds", order: 1 },
            { exercise: "burpees", sets: 4, reps: "30 seconds", order: 2 },
            { exercise: "mountain climbers", sets: 4, reps: "30 seconds", order: 3 },
            { exercise: "bodyweight squats", sets: 4, reps: "30 seconds", order: 4 }
        ]
    },
    {
        name: "Core Strength",
        description: "Focus on building a strong and stable core",
        category: "Core",
        difficulty: "Beginner",
        duration: 20,
        calories: 150,
        isPublic: true,
        tags: ["core", "abs", "stability"],
        exercises: [
            { exercise: "plank", sets: 3, reps: "45-60 seconds", order: 1 },
            { exercise: "mountain climbers", sets: 3, reps: "30 seconds", order: 2 },
            { exercise: "russian twists", sets: 3, reps: "15 per side", order: 3 },
            { exercise: "leg raises", sets: 3, reps: "12-15", order: 4 }
        ]
    }
];

module.exports = workoutTemplates;